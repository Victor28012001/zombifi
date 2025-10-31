import { Client, PrivateKey, ContractCreateTransaction, ContractFunctionParameters, Hbar } from "@hashgraph/sdk";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function deploySimple() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    // Use a fresh client instance
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    try {
        console.log("🚀 Simple deployment approach...");
        
        // Find and read bytecode
        const buildDir = "contracts/build";
        const files = readdirSync(buildDir);
        const binFile = files.find(file => file.endsWith('.bin') && file.includes('NFTCreator'));
        const bytecode = readFileSync(`contracts/build/${binFile}`, "utf8");
        
        console.log("📦 Bytecode size:", bytecode.length, "bytes");
        
        // Direct deployment without file service
        const contractCreateTx = new ContractCreateTransaction()
            .setBytecode(bytecode)
            .setGas(3000000)  // Increased gas
            .setConstructorParameters(new ContractFunctionParameters())
            .setMaxTransactionFee(new Hbar(15));  // Increased fee

        console.log("⏳ Executing deployment...");
        const txResponse = await contractCreateTx.execute(client);
        console.log("⏳ Waiting for receipt...");
        const receipt = await txResponse.getReceipt(client);
        
        console.log("🎉 SUCCESS! Contract deployed!");
        console.log("📄 Contract ID:", receipt.contractId.toString());
        
        updateEnvFile("CONTRACT_ID", receipt.contractId.toString());
        
    } catch (error) {
        console.error("❌ Simple deployment failed:", error.message);
        console.log("Full error:", error);
    } finally {
        client.close();
    }
}

function updateEnvFile(key, value) {
    const envPath = ".env";
    let envContent = readFileSync(envPath, "utf8");
    
    if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}\n`;
    }
    
    writeFileSync(envPath, envContent);
    console.log(`💾 Updated .env with ${key}`);
}

deploySimple().catch(console.error);