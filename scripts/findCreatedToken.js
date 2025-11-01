import { Client, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function findCreatedToken() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    console.log("🔍 Searching for recently created tokens...");

    try {
        // Method 1: Check transactions to find token creation
        console.log("📊 Checking recent transactions...");
        const txResponse = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=${operatorId}&limit=5&order=desc`);
        const txData = await txResponse.json();
        
        let tokenId = null;
        
        if (txData.transactions) {
            for (const tx of txData.transactions) {
                console.log("📝 Transaction:", tx.transaction_id, "-", tx.name);
                
                // Look for token creation transactions
                if (tx.token_id) {
                    tokenId = tx.token_id;
                    console.log("🎯 Found token in transaction:", tokenId);
                    break;
                }
                
                // Check if this is a contract call that created a token
                if (tx.contract_id === process.env.CONTRACT_ID) {
                    console.log("🔍 Contract call transaction found");
                    // The token might be in the transaction details
                }
            }
        }

        // Method 2: Search all tokens for ones created recently
        if (!tokenId) {
            console.log("🔍 Searching all recent tokens...");
            const tokensResponse = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/tokens?limit=10&order=desc`);
            const tokensData = await tokensResponse.json();
            
            if (tokensData.tokens) {
                // Look for tokens created in the last few minutes
                const recentTokens = tokensData.tokens.filter(token => {
                    const created = new Date(token.created_timestamp);
                    const now = new Date();
                    return (now - created) < 10 * 60 * 1000; // Last 10 minutes
                });
                
                if (recentTokens.length > 0) {
                    tokenId = recentTokens[0].token_id;
                    console.log("🎯 Found recently created token:", tokenId);
                }
            }
        }

        if (tokenId) {
            console.log("\n🎉 TOKEN FOUND:", tokenId);
            
            // Update .env
            const fs = require('fs');
            let envContent = fs.readFileSync('.env', 'utf8');
            if (envContent.includes('TOKEN_ID=')) {
                envContent = envContent.replace(/TOKEN_ID=.*/, `TOKEN_ID=${tokenId}`);
            } else {
                envContent += `\nTOKEN_ID=${tokenId}\n`;
            }
            fs.writeFileSync('.env', envContent);
            console.log("💾 Updated .env with TOKEN_ID");
            
            return tokenId;
        } else {
            console.log("❌ Could not find the token automatically");
            console.log("💡 Let's use a manual approach...");
            return null;
        }
        
    } catch (error) {
        console.error("Search failed:", error.message);
        return null;
    }
}

findCreatedToken().catch(console.error);