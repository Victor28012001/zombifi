import { Client, PrivateKey, ContractCreateTransaction, ContractFunctionParameters, Hbar, FileCreateTransaction } from "@hashgraph/sdk";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function deployContract() {
    // Configure client
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        console.log("📦 Looking for contract bytecode...");
        
        // Check what files exist in build directory
        const buildDir = "contracts/build";
        const files = readdirSync(buildDir);
        console.log("📁 Files in build directory:", files);
        
        // Find the .bin file (it might have a different name)
        const binFile = files.find(file => file.endsWith('.bin') && file.includes('NFTCreator'));
        
        if (!binFile) {
            console.error("❌ No NFTCreator .bin file found in contracts/build/");
            console.log("💡 Available files:", files);
            return;
        }
        
        console.log("✅ Found bytecode file:", binFile);
        
        // Read the compiled bytecode
        const bytecode = readFileSync(`contracts/build/${binFile}`, "utf8");
        
        console.log("📤 Uploading contract bytecode to Hedera File Service...");
        
        // Create a file for the bytecode
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(bytecode)
            .setMaxTransactionFee(new Hbar(5));
            
        const fileCreateSubmit = await fileCreateTx.execute(client);
        const fileCreateRx = await fileCreateSubmit.getReceipt(client);
        const bytecodeFileId = fileCreateRx.fileId;
        
        console.log("✅ Bytecode uploaded to File ID:", bytecodeFileId.toString());

        console.log("🚀 Deploying contract...");
        
        // Deploy contract using the file
        const contractCreateTx = new ContractCreateTransaction()
            .setBytecodeFileId(bytecodeFileId)
            .setGas(2000000)
            .setConstructorParameters(new ContractFunctionParameters())
            .setMaxTransactionFee(new Hbar(10));

        // Sign and execute the transaction
        const contractResponse = await contractCreateTx.execute(client);
        const contractReceipt = await contractResponse.getReceipt(client);
        
        const contractId = contractReceipt.contractId;
        console.log("✅ Contract deployed successfully!");
        console.log("📄 Contract ID:", contractId.toString());
        
        updateEnvFile("CONTRACT_ID", contractId.toString());
        
        return contractId;
    } catch (error) {
        console.error("❌ Contract deployment failed:", error.message);
        throw error;
    } finally {
        client.close();
    }
}

function updateEnvFile(key, value) {
    try {
        const envPath = ".env";
        let envContent = "";
        
        try {
            envContent = readFileSync(envPath, "utf8");
        } catch (e) {}
        
        if (envContent.includes(`${key}=`)) {
            envContent = envContent.replace(
                new RegExp(`${key}=.*`),
                `${key}=${value}`
            );
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