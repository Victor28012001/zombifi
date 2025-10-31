import { Client, PrivateKey, AccountBalanceQuery } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function testNetwork() {
    console.log("🌐 Testing network connectivity...");
    
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    
    // Try different network configurations
    const configs = [
        { name: "Default Testnet", client: Client.forTestnet() },
        { name: "Specific Testnet", client: Client.forName("testnet") },
        { name: "With Mirror", client: Client.forTestnet().setMirrorNetwork(["testnet.mirrornode.hedera.com:443"]) }
    ];
    
    for (const config of configs) {
        try {
            console.log(`\n🔧 Trying: ${config.name}...`);
            const client = config.client.setOperator(operatorId, operatorKey);
            
            const balance = await new AccountBalanceQuery()
                .setAccountId(operatorId)
                .execute(client);
                
            console.log(`✅ ${config.name}: Connected! Balance: ${balance.hbars.toString()}`);
            client.close();
            return true;
            
        } catch (error) {
            console.log(`❌ ${config.name}: Failed - ${error.message}`);
        }
    }
    
    console.log("\n💡 All network connections failed. This might be:");
    console.log("   - Temporary Hedera network issue");
    console.log("   - Firewall/network restrictions");
    console.log("   - DNS resolution problems");
    return false;
}

testNetwork().catch(console.error);