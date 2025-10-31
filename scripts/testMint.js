import { AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function testMint() {
    try {
        // Test with operator account as receiver
        const testAccountId = process.env.OPERATOR_ID;
        const receiverAddress = AccountId.fromString(testAccountId).toSolidityAddress();
        
        console.log("🧪 Testing NFT mint...");
        console.log("Receiver:", receiverAddress);
        
        const response = await fetch('http://localhost:3000/api/mint-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiverAddress: receiverAddress,
                achievementType: 'level_complete',
                score: 1000
            })
        });
        
        const result = await response.json();
        console.log('✅ Test mint result:', result);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testMint();