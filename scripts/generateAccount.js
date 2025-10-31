import { Client, PrivateKey, AccountCreateTransaction, Hbar } from "@hashgraph/sdk";
import { writeFileSync } from "fs";

async function generateAccount() {
    // Generate new private key
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    console.log("🔑 Generating new Hedera testnet account...");
    console.log("📝 Please wait, this may take a moment...");

    // We'll use a free public testnet node (no operator needed for generation)
    const client = Client.forTestnet();

    try {
        // Create new account (requires no initial operator)
        const transaction = new AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(Hbar.from(0)); // Start with 0 HBAR

        // Submit the transaction
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        const newAccountId = receipt.accountId;

        console.log("✅ New Account Created!");
        console.log("📝 Account ID:", newAccountId.toString());
        console.log("🔐 Private Key (DER hex):", newPrivateKey.toStringDer());
        console.log("🔑 Public Key:", newPublicKey.toStringDer());

        // Save to .env file
        const envContent = `OPERATOR_ID=${newAccountId.toString()}
OPERATOR_KEY=${newPrivateKey.toStringDer()}
CONTRACT_ID=
TOKEN_ID=`;

        writeFileSync(".env", envContent);
        console.log("💾 Saved to .env file");

        console.log("\n🎯 Next Steps:");
        console.log("1. Get testnet HBAR from: https://portal.hedera.com/");
        console.log("2. Use this Account ID:", newAccountId.toString());
        console.log("3. Then run: npm run deploy");

        return { accountId: newAccountId, privateKey: newPrivateKey };

    } catch (error) {
        console.error("❌ Account creation failed:", error.message);
        
        if (error.message.includes("INSUFFICIENT_TX_FEE")) {
            console.log("\n💡 Try using HashPack wallet method below instead.");
        }
        
        // Still show the keys for manual creation
        console.log("\n📋 Generated Keys (use these manually):");
        console.log("Private Key:", newPrivateKey.toStringDer());
        console.log("Public Key:", newPublicKey.toStringDer());
        console.log("\n🔗 Go to https://portal.hedera.com/ to create account with these keys");
        
        return { privateKey: newPrivateKey };
    } finally {
        client.close();
    }
}

generateAccount().catch(console.error);