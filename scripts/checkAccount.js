import { Client, PrivateKey, AccountBalanceQuery } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function checkAccount() {
    try {
        console.log("🔍 Checking account status...");
        
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
        
        console.log("📝 Account ID:", operatorId);
        console.log("🔑 Using operator key...");
        
        const client = Client.forTestnet().setOperator(operatorId, operatorKey);

        // Test connection with a simple balance query
        const balance = await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .execute(client);

        console.log("✅ Connection successful!");
        console.log("💰 Balance:", balance.hbars.toString());
        console.log("🎯 Account is ready for deployment");

        client.close();
        return true;
    } catch (error) {
        console.error("❌ Account check failed:", error.message);
        
        if (error.message.includes("INVALID_ACCOUNT_ID")) {
            console.log("💡 Check your OPERATOR_ID format - should be like 0.0.1234567");
        } else if (error.message.includes("INVALID_SIGNATURE")) {
            console.log("💡 Check your OPERATOR_KEY format - should be DER encoded");
        } else if (error.message.includes("UNAUTHORIZED")) {
            console.log("💡 Account may not have sufficient HBAR for transactions");
        } else {
            console.log("💡 Possible network issue or account configuration problem");
        }
        
        return false;
    }
}

checkAccount().catch(console.error);
