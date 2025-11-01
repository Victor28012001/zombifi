import { Client, PrivateKey, ContractExecuteTransaction, ContractFunctionParameters, Hbar } from "@hashgraph/sdk";
import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function createTokenOnly() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const contractId = process.env.CONTRACT_ID;
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        console.log("🎨 Creating NFT token using pre-deployed contract...");
        console.log("📝 Contract ID:", contractId);
        
        const createTokenTx = new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(4000000)
            .setFunction(
                "createNft",
                new ContractFunctionParameters()
                    .addString("Game Achievements")
                    .addString("GACHV")
                    .addString("NFT rewards for game achievements")
                    .addInt64(1000) // maxSupply
                    .addInt64(7890000) // autoRenewPeriod
            )
            .setMaxTransactionFee(new Hbar(15));

        console.log("⏳ Executing token creation...");
        const response = await createTokenTx.execute(client);
        const receipt = await response.getReceipt(client);
        
        console.log("✅ Token creation status:", receipt.status.toString());
        
        // Get the token address
        const record = await response.getRecord(client);
        const tokenAddress = record.contractFunctionResult.getAddress(0);
        console.log("🎯 Token Address:", tokenAddress);
        
        // Convert to TokenId
        const tokenId = `0.0.${Buffer.from(tokenAddress.slice(2), 'hex').readUInt32BE(12)}`;
        console.log("🆔 Token ID:", tokenId);
        
        // Update .env
        updateEnvFile("TOKEN_ID", tokenId);
        
        console.log("\n🎉 Success! Your NFT system is ready!");
        console.log("Next: Test minting with: npm run test-mint");
        
        return tokenId;
    } catch (error) {
        console.error("❌ Token creation failed:", error.message);
        if (error.message.includes("UNKNOWN")) {
            console.log("💡 Testnet contract service is down. Try again in a few hours.");
        }
    } finally {
        client.close();
    }
}

function updateEnvFile(key, value) {
    const envPath = ".env";
    let envContent = require("fs").readFileSync(envPath, "utf8");
    
    if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}\n`;
    }
    
    require("fs").writeFileSync(envPath, envContent);
    console.log(`💾 Updated .env with ${key}`);
}

createTokenOnly().catch(console.error);