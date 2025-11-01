import {
  Client,
  PrivateKey,
  ContractCreateTransaction,
  ContractFunctionParameters,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction, // ✅ Missing import added
} from "@hashgraph/sdk";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function deployContract() {
  // Configure client
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

  console.log("👤 Operator ID:", operatorId);
  console.log("🔑 Key valid:", operatorKey ? "✅" : "❌");

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  try {
    console.log("📦 Looking for contract bytecode...");

    // Check what files exist in build directory
    const buildDir = "contracts/build";
    const files = readdirSync(buildDir);
    console.log("📁 Files in build directory:", files);

    // Find the .bin file (it might have a different name)
    const binFile = files.find(
      (file) => file.endsWith(".bin") && file.includes("NFTCreator")
    );

    if (!binFile) {
      console.error("❌ No NFTCreator .bin file found in contracts/build/");
      console.log("💡 Available files:", files);
      return;
    }

    console.log("✅ Found bytecode file:", binFile);

    // Read the compiled bytecode
    const bytecode = readFileSync(`contracts/build/${binFile}`, "utf8");

    console.log("📤 Uploading contract bytecode to Hedera File Service...");

    // Create a new file for the bytecode
    const fileCreateTx = await new FileCreateTransaction()
      .setKeys([operatorKey])
      .setMaxTransactionFee(new Hbar(100))
      .execute(client);

    const fileCreateRx = await fileCreateTx.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;

    // Append the bytecode (in case it's large)
    await new FileAppendTransaction()
      .setFileId(bytecodeFileId)
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(50))
      .execute(client);

    console.log("✅ Bytecode uploaded to:", bytecodeFileId.toString());

    console.log("🚀 Deploying contract...");

    // Deploy contract with higher gas and transaction fee
    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(4_000_000)
      .setConstructorParameters(new ContractFunctionParameters()) // optional, but good to include
      .setMaxTransactionFee(new Hbar(100));

    const response = await contractCreateTx.execute(client);
    const receipt = await response.getReceipt(client);
    const contractId = receipt.contractId;

    console.log("✅ Contract deployed successfully!");
    console.log("📄 Contract ID:", contractId.toString());

    // Save contract ID to .env
    updateEnvFile("CONTRACT_ID", contractId.toString());

    return contractId;
  } catch (error) {
    console.error("❌ Contract deployment failed:", error.message);
    console.error(error); // full stack trace
  } finally {
    client.close();
  }
}

// Save deployed contract ID in .env
function updateEnvFile(key, value) {
  try {
    const envPath = ".env";
    let envContent = "";

    try {
      envContent = readFileSync(envPath, "utf8");
    } catch (e) {}

    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}\n`;
    }

    writeFileSync(envPath, envContent);
    console.log(`💾 Updated .env with ${key}`);
  } catch (error) {
    console.error("Error updating .env:", error);
  }
}

deployContract().catch(console.error);
