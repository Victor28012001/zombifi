// import {
//   Client,
//   PrivateKey,
//   ContractExecuteTransaction,
//   ContractFunctionParameters,
//   Hbar,
//   TransactionRecordQuery,
//   TransferTransaction, // ✅ add this import
// } from "@hashgraph/sdk";
// import { readFileSync, writeFileSync } from "fs";
// import dotenv from "dotenv";

// dotenv.config();

// async function createNFTToken() {
//   const operatorId = process.env.OPERATOR_ID;
//   const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
//   const contractId = process.env.CONTRACT_ID;

//   if (!contractId) {
//     console.log("❌ Please deploy the contract first using: npm run deploy");
//     return;
//   }

//   const client = Client.forTestnet().setOperator(operatorId, operatorKey);

//   try {
//     // 🪙 Step 1: Fund the contract with 5 HBAR before token creation
//     console.log("💰 Funding contract with 5 HBAR...");
//     const transferTx = await new TransferTransaction()
//       .addHbarTransfer(operatorId, new Hbar(-5)) // send 5 HBAR from your account
//       .addHbarTransfer(contractId, new Hbar(5))  // to the contract
//       .execute(client);

//     const transferReceipt = await transferTx.getReceipt(client);
//     console.log("✅ Contract funded successfully:", transferReceipt.status.toString());

//     // 🎨 Step 2: Now execute the token creation function
//     console.log("🎨 Creating NFT token via contract...");

//     const createTokenTx = new ContractExecuteTransaction()
//       .setContractId(contractId)
//       .setGas(10_000_000) // 🔼 Increased to ensure enough gas
//       .setFunction(
//         "createNft",
//         new ContractFunctionParameters()
//           .addString("Game Achievements")
//           .addString("GACHV")
//           .addString("NFT rewards for game achievements")
//           .addInt64(1000)
//           .addInt64(0)
//       )
//       .setMaxTransactionFee(new Hbar(100));

//     const response = await createTokenTx.execute(client);
//     const receipt = await response.getReceipt(client);
//     console.log("✅ NFT token creation transaction:", receipt.status.toString());

//     const record = await response.getRecord(client);
//     const tokenAddress = record.contractFunctionResult.getAddress(0);
//     console.log("🎯 Token Address:", tokenAddress);

//     const tokenId = `0.0.${Buffer.from(tokenAddress.slice(2), "hex").readUInt32BE(12)}`;
//     console.log("🆔 Token ID:", tokenId);

//     updateEnvFile("TOKEN_ID", tokenId);
//     return tokenId;
//   } catch (error) {
//     console.error("❌ Token creation failed:", error.message);
//     if (error.transactionId) {
//       try {
//         const rec = await new TransactionRecordQuery()
//           .setTransactionId(error.transactionId)
//           .execute(client);
//         console.log("🧩 Contract revert reason:", rec.contractFunctionResult.errorMessage || "None");
//       } catch (innerErr) {
//         console.log("⚠️ Could not fetch revert reason:", innerErr.message);
//       }
//     }
//     throw error;
//   } finally {
//     client.close();
//   }
// }

// function updateEnvFile(key, value) {
//   try {
//     const envPath = ".env";
//     let envContent = readFileSync(envPath, "utf8");
//     if (envContent.includes(`${key}=`)) {
//       envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
//     } else {
//       envContent += `\n${key}=${value}\n`;
//     }
//     writeFileSync(envPath, envContent);
//     console.log(`💾 Updated .env with ${key}=${value}`);
//   } catch (error) {
//     console.error("Error updating .env:", error);
//   }
// }

// createNFTToken().catch(console.error);
import { 
  Client, PrivateKey, AccountId, 
  TokenCreateTransaction, TokenType, TokenSupplyType
} from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_KEY = PrivateKey.fromString(process.env.OPERATOR_KEY);

const client = Client.forTestnet().setOperator(OPERATOR_ID, OPERATOR_KEY);

async function createNFTToken() {
  const transaction = await new TokenCreateTransaction()
    .setTokenName("Game Achievement NFT")
    .setTokenSymbol("GAME")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(OPERATOR_ID)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000)               // Max NFTs
    .setSupplyKey(OPERATOR_KEY)        // <--- Supply key added here
    .freezeWith(client);

  const signTx = await transaction.sign(OPERATOR_KEY);
  const txResponse = await signTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  console.log("NFT Token ID:", receipt.tokenId.toString());
}

createNFTToken();
