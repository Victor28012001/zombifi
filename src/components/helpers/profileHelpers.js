import { client } from "../../utils/honeyCombServices.js";
import * as web3 from "@solana/web3.js";
import { sendTransactionForTests } from "@honeycomb-protocol/edge-client/client/helpers.js";
import axios from "axios";
import { getUserPublicKey } from "../../utils/walletState.js";
import { GameState } from "../../core/GameState.js";

export class ProfileHelpers {
  getDefaultAvatar() {
    return "https://www.arweave.net/qR_n1QvCaHqVTYFaTdnZoAXR6JBwWspDLtDNcLj2a5w?ext=png";
  }

  formatPublicKey(publickey) {
    return publickey && publickey.length >= 8
      ? `${publickey.slice(0, 6)}...${publickey.slice(-4)}`
      : "Connect Wallet";
  }

  async fetchChainProfiles(publickey) {
    const { user: usersArray } = await client.findUsers({
      wallets: [publickey],
      includeProof: true,
    });

    if (!usersArray?.length) return [];

    const { profile: profilesArray } = await client.findProfiles({
      userIds: [usersArray[0].id],
      includeProof: true,
    });

    if (!profilesArray?.length) return [];

    return profilesArray.map((profile) => {
      const profileInfo = profile.info || {};
      const customData = profile.customData || {};
      const platformData = profile.platformData || {};
      const xpValue = platformData.xp ? parseInt(platformData.xp) : 0;
      const stats = customData.stats
        ? JSON.parse(customData.stats[0])
        : this.getDefaultStats();
        GameState.data = profile;

      return {
        name: profileInfo.name || "Unnamed",
        description: profileInfo.bio || "",
        image: profileInfo.pfp || this.getDefaultAvatar(),
        chosen: false,
        isChainProfile: true,
        chainData: profile,
        address: profile.address,
        stats: stats,
        xp: xpValue,
        achievements: customData.achievements
          ? JSON.parse(customData.achievements[0])
          : [],
        userId: profile.userId,
      };
    });
  }

  getDefaultStats() {
    return {
      healthBoost: 0,
      energyBoost: 0,
      strengthBoost: 0,
      speedBoost: 0,
      energyEfficiency: 0,
      energyCapacity: 0,
      damageBoost: 0,
      xpBoost: 0,
    };
  }

  createDefaultProfile(publickey) {
    return {
      name: "Default",
      description: publickey
        ? "Create your first profile"
        : "Connect wallet to create profile",
      image: this.getDefaultAvatar(),
      chosen: true,
      isChainProfile: false,
      disabled: true,
      xp: 0,
      achievements: [],
      chainData: {
        info: {
          name: "Default",
          bio: "",
          pfp: this.getDefaultAvatar(),
        },
      },
    };
  }

  getTierDisplayInfo(xp) {
    const xpNumber = Number(xp) || 0;
    if (xpNumber >= 5000) return { tier: "Legend", percent: 100 };
    if (xpNumber >= 1000) {
      return {
        tier: "Veteran",
        percent: Math.min(100, ((xpNumber - 1000) / 4000) * 100),
      };
    }
    return { tier: "Rookie", percent: Math.min(100, (xpNumber / 1000) * 100) };
  }

  createXPBadge(profile) {
    return profile.isChainProfile
      ? `<div class="xp-badge">${profile.xp} XP</div>`
      : "";
  }

  createTierBadge(tierInfo) {
    return `
      <div class="tier-badge ${tierInfo.tier.toLowerCase()}">
        ${tierInfo.tier}
      </div>
    `;
  }

  createXPProgress(profile, tierInfo) {
    return `
      <div class="xp-progress">
        <div class="progress-bar" style="width: ${tierInfo.percent}%"></div>
        <span id="xp">${profile.xp || 0} XP</span>
      </div>
    `;
  }

  createCornerDivs(baseClass) {
    return Array.from({ length: 4 }, (_, i) => 
      `<div class="${baseClass}${i + 1}"></div>`
    ).join("");
  }

  async uploadToIPFS(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `https://aquamarine-working-thrush-698.mypinata.cloud/ipfs/${ipfsHash}`;
  }

  async submitProfileToChain(name, desc, imageUrl) {
    const pub = getUserPublicKey();
    if (!pub) throw new Error("Wallet not connected");

    const projectAddress = import.meta.env.VITE_PROJECT_KEY;
    const secret = JSON.parse(import.meta.env.VITE_ADMIN_KEY);

    if (!Array.isArray(secret) || secret.length !== 64) {
      throw new Error("Invalid admin key");
    }

    const adminKeyPair = web3.Keypair.fromSecretKey(new Uint8Array(secret));

    const { createNewUserWithProfileTransaction: txResponse } =
      await client.createNewUserWithProfileTransaction({
        project: projectAddress.toString(),
        wallet: pub.toString(),
        payer: adminKeyPair.publicKey.toString(),
        profileIdentity: "main",
        userInfo: {
          name: name,
          bio: desc,
          pfp: imageUrl,
        },
      });

    return await sendTransactionForTests(
      client,
      {
        blockhash: txResponse.blockhash,
        lastValidBlockHeight: txResponse.lastValidBlockHeight,
        transaction: txResponse.transaction,
      },
      [adminKeyPair],
      {
        skipPreflight: true,
        commitment: "finalized",
      }
    );
  }

  showMessage(root, title, text, duration = 1500) {
    this.clearMessage();

    const container = document.createElement("div");
    container.id = "game-message-container";
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;

    container.innerHTML = `
      <h2 style="margin: 0 0 10px 0; font-size: 2em; color: #4CAF50;">${title}</h2>
      <p style="margin: 0; font-size: 1.2em;">${text}</p>
    `;

    root.appendChild(container);
    container.style.opacity = "1";

    this.messageTimeout = setTimeout(() => {
      this.clearMessage();
    }, duration);
  }

  showError(root, title, message) {
    this.showMessage(root, title, message, 3000);

    const container = document.getElementById("game-message-container");
    if (container) {
      const titleElement = container.querySelector("h2");
      if (titleElement) {
        titleElement.style.color = "#f44336";
      }
    }
  }

  clearMessage() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }

    const container = document.getElementById("game-message-container");
    if (container) {
      container.style.opacity = "0";
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    }
  }
}