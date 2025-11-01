import { Client, PrivateKey, AccountInfoQuery } from "@hashgraph/sdk";
import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

async function findTokenId() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        console.log("🔍 Searching for your NFT token...");
        
        // Get account info to see associated tokens
        const accountInfo = await new AccountInfoQuery()
            .setAccountId(operatorId)
            .execute(client);

        console.log("✅ Account info retrieved");
        
        // Check token relationships
        if (accountInfo.tokenRelationships) {
            const tokens = Array.from(accountInfo.tokenRelationships.keys());
            console.log("🎯 Found token relationships:", tokens.length);
            
            tokens.forEach(tokenId => {
                console.log("🆔 Token ID:", tokenId.toString());
            });
            
            if (tokens.length > 0) {
                // Use the first token (most likely your new NFT token)
                const tokenId = tokens[0].toString();
                console.log("\n🎉 Using Token ID:", tokenId);
                
                updateEnvFile("TOKEN_ID", tokenId);
                return tokenId;
            }
        }
        
        console.log("❌ No tokens found in account relationships");
        console.log("💡 The token might be created but not associated yet");
        
    } catch (error) {
        console.error("Error:", error.message);
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
    console.log(`💾 Updated .env with ${key}=${value}`);
}

findTokenId().catch(console.error);