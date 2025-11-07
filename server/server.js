import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TokenMintTransaction,
  TransferTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_KEY = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
const TOKEN_ID = TokenId.fromString(process.env.TOKEN_ID);

if (
  !process.env.OPERATOR_ID ||
  !process.env.OPERATOR_KEY ||
  !process.env.TOKEN_ID
) {
  throw new Error("Missing OPERATOR_ID, OPERATOR_KEY, or TOKEN_ID in .env");
}

const client = Client.forName("testnet").setOperator(OPERATOR_ID, OPERATOR_KEY);

console.log("✅ Environment loaded:");
console.log(`Operator ID: ${OPERATOR_ID.toString()}`);
console.log(`Operator EVM Address: ${OPERATOR_ID.toEvmAddress()}`);
console.log(`Token ID: ${TOKEN_ID.toString()}`);
console.log("----------------------------------------");

// Achievement metadata - only store IPFS hashes (short)
const achievements = {
  level1:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level1.json",
  level2:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level2.json",
  level3:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level3.json",
  level4:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level4.json",
  level5:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level5.json",
  level6:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level6.json",
  level7:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level7.json",
  level8:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level8.json",
  level_complete:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/level_complete.json",
  high_score:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/high_score.json",
  all_levels:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/all_levels.json",
  tier_upgrade:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/tier_upgrade.json",
  achievement:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/special_achievement.json",
  first_win:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/first_win.json",
  speed_runner:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/speed_runner.json",
  collector:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/collector.json",
  sharpshooter:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/sharpshooter.json",
  explorer:
    "bafybeig3ilx4zeb4wqms5q6co6eutailajxerudfmeiowrfe7jrj7i77vu/explorer.json",
};

// 🔍 Helper: resolve EVM or Hedera Account ID
async function resolveAccountId(receiverAddress) {
  // Already a Hedera ID? Just return it
  if (/^\d+\.\d+\.\d+$/.test(receiverAddress)) {
    return receiverAddress;
  }

  let evmAddr = receiverAddress.toLowerCase();
  if (!evmAddr.startsWith("0x")) evmAddr = "0x" + evmAddr;

  console.log(`🔍 Resolving EVM address: ${evmAddr}`);

  // 1️⃣ Try new-style API
  let res = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/accounts/evm/${evmAddr}`
  );

  if (res.ok) {
    const data = await res.json();
    if (data.account) {
      console.log(`✅ Found via /accounts/evm/: ${data.account}`);
      return data.account;
    }
  }

  // 2️⃣ Try fallback search
  res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts`);
  if (res.ok) {
    const data = await res.json();
    const found = data.accounts?.find(
      (acc) => acc.evm_address?.toLowerCase() === evmAddr
    );
    if (found) {
      console.log(`✅ Found via fallback /accounts list: ${found.account}`);
      return found.account;
    }
  }

  throw new Error(
    "No Hedera account found for this EVM address on testnet — try using the Hedera Account ID (e.g., 0.0.xxxxx)."
  );
}

// 🧩 Associate token safely
async function associateToken(receiverId) {
  try {
    const receiverKey = PrivateKey.fromStringECDSA(process.env.RECEIVER_KEY);
    const tx = await new TokenAssociateTransaction()
      .setAccountId(receiverId)
      .setTokenIds([TOKEN_ID])
      .setTransactionValidDuration(120)
      .freezeWith(client)
      .sign(receiverKey);

    const rx = await tx.execute(client);
    await rx.getReceipt(client);
    console.log(`✅ Account ${receiverId} associated with token ${TOKEN_ID}`);
  } catch (error) {
    if (
      error.message &&
      error.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")
    ) {
      console.log(
        `⚠️ Account ${receiverId} is already associated with token ${TOKEN_ID}`
      );
      return;
    }
    throw error;
  }
}

// 🪙 Mint NFT route
app.get("/api/mint-nft/:receiverAddress/:achievement", async (req, res) => {
  try {
    const { receiverAddress, achievement } = req.params;

    if (!achievements[achievement]) {
      return res.status(400).json({ error: "Invalid achievement key" });
    }

    const hederaAccountIdStr = await resolveAccountId(receiverAddress);
    const receiverId = AccountId.fromString(hederaAccountIdStr);

    const metadata = Buffer.from(achievements[achievement]);
    const serial = await mintNFT(receiverId, metadata);

    res.status(200).json({ serial, accountId: receiverId.toString() });
  } catch (error) {
    console.error("❌ Minting error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🪙 Mint + Transfer NFT
async function mintNFT(receiverId, metadata) {
  await associateToken(receiverId);

  const mintTx = await new TokenMintTransaction()
    .setTokenId(TOKEN_ID)
    .setMetadata([metadata])
    .setTransactionValidDuration(120)
    .execute(client);

  const mintRx = await mintTx.getReceipt(client);
  const serial = mintRx.serials[0];
  console.log(`🪙 NFT minted with serial: ${serial}`);

  const transferTx = await new TransferTransaction()
    .addNftTransfer(TOKEN_ID, serial, OPERATOR_ID, receiverId)
    .setTransactionValidDuration(120)
    .execute(client);

  const transferRx = await transferTx.getReceipt(client);
  console.log(`📦 NFT transfer status: ${transferRx.status}`);

  return serial;
}

app.listen(PORT, () => {
  console.log(`🚀 NFT backend running on port ${PORT}`);
  console.log(`GET /api/mint-nft/:receiverAddress/:achievement - Mint NFT`);
});
