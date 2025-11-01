import {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionRecordQuery,
} from "@hashgraph/sdk";
import { readFileSync, writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function createNFTToken() {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY); // ✅ Fixed
  const contractId = process.env.CONTRACT_ID;

  if (!contractId) {
    console.log("❌ Please deploy the contract first using: npm run deploy");
    return;
  }

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  try {
    console.log("🎨 Creating NFT token via contract...");

    const createTokenTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(5_000_000)
      .setFunction(
        "createNft",
        new ContractFunctionParameters()
          .addString("Game Achievements")
          .addString("GACHV")
          .addString("NFT rewards for game achievements")
          .addInt64(1000)
          .addInt64(7_890_000)
      )
      .setMaxTransactionFee(new Hbar(100));

    const response = await createTokenTx.execute(client);
    const receipt = await response.getReceipt(client);
    console.log("✅ NFT token creation transaction:", receipt.status.toString());

    const record = await response.getRecord(client);
    const tokenAddress = record.contractFunctionResult.getAddress(0);
    console.log("🎯 Token Address:", tokenAddress);

    const tokenId = `0.0.${Buffer.from(tokenAddress.slice(2), "hex").readUInt32BE(12)}`;
    console.log("🆔 Token ID:", tokenId);

    updateEnvFile("TOKEN_ID", tokenId);
    return tokenId;
  } catch (error) {
    console.error("❌ Token creation failed:", error.message);
    if (error.transactionId) {
      try {
        const rec = await new TransactionRecordQuery()
          .setTransactionId(error.transactionId)
          .execute(client);
        console.log("🧩 Contract revert reason:", rec.contractFunctionResult.errorMessage || "None");
      } catch (innerErr) {
        console.log("⚠️ Could not fetch revert reason:", innerErr.message);
      }
    }
    throw error;
  } finally {
    client.close();
  }
}

function updateEnvFile(key, value) {
  try {
    const envPath = ".env";
    let envContent = readFileSync(envPath, "utf8");
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}\n`;
    }
    writeFileSync(envPath, envContent);
    console.log(`💾 Updated .env with ${key}=${value}`);
  } catch (error) {
    console.error("Error updating .env:", error);
  }
}

createNFTToken().catch(console.error);
