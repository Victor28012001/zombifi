import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import {
  LedgerId,
  AccountId,
  TokenAssociateTransaction,
  TokenId,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const LEDGER = LedgerId.TESTNET;
const PROJECT_ID = import.meta.env.VITE_HEDERA_PROJECT_ID;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;
const TOKEN_ID = TokenId.fromString(import.meta.env.VITE_HEDERA_TOKEN_ID);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const metadata = {
  name: "Zombifi",
  description: "A Zombified Game that uses NFT to Reward Players for Game Achievements",
  url: window.location.origin,
  icons: [window.location.origin + "/icon.png"],
};

export class HederaNFTService {
  constructor() {
    this.connector = null;
    this.signer = null;
    this.accountId = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.connector = new DAppConnector(
        metadata,
        LEDGER,
        PROJECT_ID,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet]
      );

      await this.connector.init({ logger: "error" });
      this.isInitialized = true;

      // Check if already connected
      this.signer = this.connector.signers?.[0];
      this.accountId = this.signer?.getAccountId()?.toString() || null;

      if (this.accountId) {
        window.currentWallet = { accountId: this.accountId };
      }
    } catch (error) {
      console.error("Failed to initialize Hedera service:", error);
      throw error;
    }
  }

  async connectWallet() {
    if (!this.isInitialized) await this.init();

    try {
      console.log("Opening WalletConnect modal...");
      await this.connector.openModal();
    } catch (e) {
      console.warn("Connect cancelled:", e.message || e);
      return null;
    }

    // Wait for signer to be available (up to 10s)
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        this.signer = this.connector.signers?.[0];
        if (this.signer) {
          this.accountId = this.signer.getAccountId().toString();
          window.currentWallet = { accountId: this.accountId };
          console.log("Connected wallet:", this.accountId);

          window.dispatchEvent(
            new CustomEvent("hedera-wallet-connected", {
              detail: { accountId: this.accountId },
            })
          );
          clearInterval(interval);
          resolve();
        } else if (++attempts > 33) {
          // 33 * 300ms ~ 10s
          clearInterval(interval);
          reject(new Error("Failed to get signer within 10s"));
        }
      }, 300);
    });

    return this.accountId;
  }

  async disconnectWallet() {
    try {
      await this.connector.disconnectAll();
    } catch (e) {
      console.warn("Disconnect error:", e.message || e);
    }

    this.signer = null;
    this.accountId = null;
    window.currentWallet = null;

    window.dispatchEvent(new CustomEvent("hedera-wallet-disconnected"));
    return true;
  }

  async requestAssociation() {
    if (!this.signer) throw new Error("Wallet not connected");

    const accountId = this.signer.getAccountId().toString();
    const isAssociated = await this.checkAssociation(accountId);

    if (isAssociated) return true;

    const tx = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([TOKEN_ID])
      .freezeWithSigner(this.signer);

    const res = await tx.executeWithSigner(this.signer);
    console.log("Association Tx:", res.transactionId.toString());
    return res;
  }

  async checkAssociation(accountId) {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Mirror Node error");
    const data = await res.json();

    return data.tokens.some((t) => t.token_id === TOKEN_ID.toString());
  }

  async mintGameNFT(achievementType, score, level = null, additionalData = {}) {
    // Validate wallet connection
    if (!this.signer || !this.accountId) {
      throw new Error(
        "Wallet not connected or accountId is undefined. Call connectWallet() first."
      );
    }

    // Extra sanity check: make sure accountId is valid Hedera ID
    if (!/^\d+\.\d+\.\d+$/.test(this.accountId)) {
      throw new Error(`Invalid Hedera accountId: ${this.accountId}`);
    }

    try {
      // Request token association if needed
      await this.requestAssociation();

      // Convert Hedera account ID to solidity address
      const receiverAddress = AccountId.fromString(
        this.accountId
      ).toSolidityAddress();

      // Call backend API to mint NFT
      const response = await fetch(
        `${API_URL}/api/mint-nft/${receiverAddress}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend minting failed.");
      }

      const result = await response.json();
      console.log("NFT Minted:", result);

      this.showNFTMintedMessage(achievementType, result.serial);

      return result;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  async getUserNFTs() {
    if (!this.accountId) return [];

    try {
      const res = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${
          this.accountId
        }/nfts?limit=20&order=desc&token.id=${TOKEN_ID.toString()}`
      );

      if (!res.ok) return [];

      const data = await res.json();
      const results = [];

      for (const nft of data?.nfts || []) {
        try {
          const url = this.decodeMetadata(nft.metadata);
          const metadata = await this.fetchMetadata(this.normalizeIpfsUri(url));
          results.push({
            ...metadata,
            tokenId: nft.token_id,
            serial: nft.serial_number,
          });
        } catch (err) {
          console.error("Failed to fetch metadata for NFT", nft, err);
        }
      }
      return results;
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
      return [];
    }
  }

  decodeMetadata(base64Metadata) {
    const buff = Buffer.from(base64Metadata, "base64");
    return buff.toString("utf-8");
  }

  normalizeIpfsUri(uri) {
    if (!uri) return null;

    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      return `${PINATA_GATEWAY}/ipfs/${cid}`;
    }
    return uri;
  }

  async fetchMetadata(url) {
    const response = await fetch(url);
    return await response.json();
  }

  showNFTMintedMessage(achievementType, serialNumber) {
    const message = document.createElement("div");
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.5s ease-out;
      max-width: 300px;
    `;

    message.innerHTML = `
      <h3 style="margin: 0 0 5px 0;">🎉 NFT Minted!</h3>
      <p style="margin: 0; font-size: 0.9em;">Achievement: ${this.formatAchievementType(
        achievementType
      )}</p>
      <p style="margin: 0; font-size: 0.8em; opacity: 0.8;">Serial: #${serialNumber}</p>
    `;

    document.body.appendChild(message);

    // Remove after 5 seconds
    setTimeout(() => {
      message.style.animation = "slideOut 0.5s ease-in";
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 500);
    }, 5000);
  }

  formatAchievementType(type) {
    const types = {
      level_complete: "Level Completed",
      high_score: "High Score",
      all_levels: "Game Master",
      tier_upgrade: "Tier Upgrade",
      achievement: "Special Achievement",
    };
    return types[type] || type;
  }

  isConnected() {
    return !!this.accountId;
  }

  getAccountId() {
    return this.accountId;
  }
}

// Add CSS for animations
if (!document.querySelector("#hedera-nft-styles")) {
  const style = document.createElement("style");
  style.id = "hedera-nft-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Create singleton instance
export const hederaNFTService = new HederaNFTService();
