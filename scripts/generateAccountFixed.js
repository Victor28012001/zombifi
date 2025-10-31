import { Client, PrivateKey, AccountCreateTransaction, Hbar, TransactionId } from "@hashgraph/sdk";
import { writeFileSync } from "fs";

async function generateAccount() {
    // Generate new private key
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    console.log("🔑 Generated new Hedera keys:");
    console.log("🔐 Private Key:", newPrivateKey.toStringDer());
    console.log("🔑 Public Key:", newPublicKey.toStringDer());

    // For testnet, we need to use a funded account or the portal
    console.log("\n🎯 Manual Account Creation Required:");
    console.log("1. Go to: https://portal.hedera.com/");
    console.log("2. Make sure you're on TESTNET (top right)");
    console.log("3. Click 'Create Account'");
    console.log("4. Choose 'Software' → 'I have a key'");
    console.log("5. Paste this Public Key:", newPublicKey.toStringDer());
    console.log("6. Complete the creation process");
    console.log("7. Your Account ID will be shown - save it!");

    // Save keys to .env template
    const envContent = `OPERATOR_ID=0.0.REPLACE_WITH_YOUR_ACCOUNT_ID
OPERATOR_KEY=${newPrivateKey.toStringDer()}
CONTRACT_ID=
TOKEN_ID=`;

    writeFileSync(".env", envContent);
    console.log("\n💾 Saved keys to .env file");
    console.log("📝 REMEMBER: Update OPERATOR_ID with your actual Account ID after creation");

    return { privateKey: newPrivateKey, publicKey: newPublicKey };
}

generateAccount().catch(console.error);