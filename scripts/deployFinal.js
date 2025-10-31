import { Client, PrivateKey, ContractCreateTransaction, ContractFunctionParameters, Hbar, FileCreateTransaction } from "@hashgraph/sdk";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function deployFinal() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        console.log("🎯 Starting contract deployment...");
        console.log("📝 Account:", operatorId);
        console.log("💰 Balance check...");
        
        // Quick balance check
        const balanceQuery = await new (await import('@hashgraph/sdk')).AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);
        console.log("✅ Balance:", balanceQuery.hbars.toString());

        console.log("📦 Reading contract bytecode...");
        
        const buildDir = "contracts/build";
        const files = readdirSync(buildDir);
        const binFile = files.find(file => file.endsWith('.bin') && file.includes('NFTCreator'));
        
        if (!binFile) {
            console.error("❌ No NFTCreator .bin file found");
            return;
        }
        
        console.log("✅ Found bytecode file:", binFile);
        const bytecode = readFileSync(`contracts/build/${binFile}`, "utf8");
        
        console.log("📤 Step 1: Uploading bytecode to Hedera File Service...");
        
        // Upload bytecode as file
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(bytecode)
            .setMaxTransactionFee(new Hbar(5));

        console.log("⏳ Executing file creation...");
        const fileCreateSubmit = await fileCreateTx.execute(client);
        console.log("⏳ Getting file receipt...");
        const fileCreateRx = await fileCreateSubmit.getReceipt(client);
        const bytecodeFileId = fileCreateRx.fileId;
        
        console.log("✅ Bytecode uploaded to File ID:", bytecodeFileId.toString());

        console.log("🚀 Step 2: Deploying contract...");
        
        // Deploy contract
        const contractCreateTx = new ContractCreateTransaction()
            .setBytecodeFileId(bytecodeFileId)
            .setGas(2000000)
            .setConstructorParameters(new ContractFunctionParameters())
            .setMaxTransactionFee(new Hbar(10));

        console.log("⏳ Executing contract creation...");
        const contractResponse = await contractCreateTx.execute(client);
        console.log("⏳ Getting contract receipt...");
        const contractReceipt = await contractResponse.getReceipt(client);
        
        const contractId = contractReceipt.contractId;
        console.log("🎉 Contract deployed successfully!");
        console.log("📄 Contract ID:", contractId.toString());
        
        updateEnvFile("CONTRACT_ID", contractId.toString());
        
        return contractId;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        console.log("🔧 Error details:", error);
        
        if (error.message.includes("INSUFFICIENT_TX_FEE")) {
            console.log("💡 Try increasing the transaction fee");
        } else if (error.message.includes("INSUFFICIENT_PAYER_BALANCE")) {
            console.log("💡 Account balance too low for deployment");
        } else if (error.message.includes("UNKNOWN")) {
            console.log("💡 Network issue - try again in a few minutes");
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
        console.log(`💾 Updated .env with ${key}`);
    } catch (error) {
        console.error("Error updating .env:", error);
    }
}

deployFinal().catch(console.error);