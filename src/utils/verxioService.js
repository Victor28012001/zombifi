// src/utils/verxioService.js
import {
  issueLoyaltyPass,
  createLoyaltyProgram,
  initializeVerxio,
} from "@verxioprotocol/core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  publicKey,
  keypairIdentity,
  generateSigner,
} from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair } from "@solana/web3.js";

// Initialize UMI with keypair identity
export const initVerxio = (feePayerKeypair) => {
  const endpoint =
    import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com";
  const umi = createUmi(endpoint)
  return umi;
};

// Helper to create keypair from secret key (browser compatible)
export const createKeypairFromSecret = (secretKey) => {
  if (typeof secretKey === "string") {
    secretKey = JSON.parse(secretKey);
  }
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
};

// const response = await fetch("https://bring-back-gladys.vercel.app/assets/images/splash_screen.png");
// const imageBuffer = await response.arrayBuffer();

// Create Loyalty Program
export const createGameLoyaltyProgram = async (
  context,
  programName,
  organizationName
) => {
  try {
    const result = await createLoyaltyProgram(context, {
      loyaltyProgramName: programName,
      metadataUri:
        "https://aquamarine-working-thrush-698.mypinata.cloud/ipfs/bafkreidom7bk32qqpgez5la6ax3czmsxainibihlay3krz5tttizh3b2ue",
      programAuthority: context.programAuthority,
      metadata: {
        organizationName,
        brandColor: "#FF0000",
      },
      updateAuthority: context.umi.identity,
      tiers: [
        { name: "Rookie", xpRequired: 0, rewards: ["Starter items"] },
        { name: "Veteran", xpRequired: 1000, rewards: ["Exclusive skins"] },
        { name: "Legend", xpRequired: 5000, rewards: ["Special abilities"] },
      ],
      pointsPerAction: {
        levelComplete: 100,
        achievementUnlock: 50,
        dailyLogin: 20,
      },
    });

    return {
      success: true,
      collectionAddress: result.collection.publicKey.toString(),
      signature: result.signature,
    };
  } catch (error) {
    console.error("Error creating program:", error);
    return { success: false, error };
  }
};

// Issue Loyalty Pass
export const issueGameLoyaltyPass = async (
  umi,
  collectionAddress,
  playerWallet,
  passName,
  organizationName
) => {
  try {
    const result = await issueLoyaltyPass(umi, {
      collectionAddress: publicKey(collectionAddress),
      recipient: publicKey(playerWallet),
      passName,
      organizationName,
      updateAuthority: umi.identity,
    });

    return {
      success: true,
      asset: result.asset,
      signature: result.signature,
      mintAddress: result.asset.publicKey.toString(),
    };
  } catch (error) {
    console.error("Error issuing pass:", error);
    return { success: false, error };
  }
};

// Complete usage example
export const runExample = async () => {
  // 1. Initialize with fee payer keypair
  const feePayerSecret = import.meta.env.VITE_FEE_PAYER_SECRET;
  const feePayer = createKeypairFromSecret(feePayerSecret);
  const umi = initVerxio(feePayer);

  // 2. Initialize Verxio context with UMI and authority
  const context = initializeVerxio(umi, umi.identity.publicKey);

  // 3. Create program
  const program = await createGameLoyaltyProgram(
    context,
    "Game Rewards",
    "My Studio"
  );
  if (!program.success) throw new Error("Failed to create program");

  // 3. Issue pass
  const pass = await issueGameLoyaltyPass(
    umi,
    program.collectionAddress,
    "CTrafojxD1SrWo14H5eAewyybYmT72Ht4QeNcxQfK6Hw",
    "VIP Pass",
    "My Studio"
  );
  if (!pass.success) throw new Error("Failed to issue pass");

  return { program, pass };
};
