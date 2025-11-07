import {
  PrivateKey,
  AccountCreateTransaction,
  Client,
  AccountBalanceQuery,
  Hbar,
} from "@hashgraph/sdk";
import fs from "fs";
import QRCode from "qrcode";
import "dotenv/config";

async function main() {
  // 1️⃣ Connect to Hedera testnet and set operator
  const client = Client.forTestnet();
  client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

  // 2️⃣ Generate a new ECDSA private key
  const newKey = PrivateKey.generateECDSA();
  console.log("✅ New Private Key:", newKey.toString());
  console.log("✅ Public Key:", newKey.publicKey.toString());

  // 3️⃣ Check operator balance
  const operatorBalance = await new AccountBalanceQuery()
    .setAccountId(process.env.OPERATOR_ID)
    .execute(client);

  console.log("Operator balance:", operatorBalance.hbars.toString());

  // Set initial balance for the new account
  // Ensure it does not exceed operator balance minus a small transaction fee buffer
  const txFeeBuffer = Hbar.fromTinybars(50_000); // 0.0005 HBAR as buffer
  let initialBalance = Hbar.fromTinybars(100_000); // default 0.001 HBAR

  if (operatorBalance.hbars.lessThan(initialBalance.add(txFeeBuffer))) {
    initialBalance = operatorBalance.hbars.subtract(txFeeBuffer);
    console.log(
      `⚠️ Operator balance is low. Setting new account initial balance to ${initialBalance.toString()}`
    );
  }

  // 4️⃣ Create a new account
  const tx = await new AccountCreateTransaction()
    .setKey(newKey.publicKey)
    .setInitialBalance(initialBalance)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log("✅ New Account ID:", receipt.accountId.toString());

  // 5️⃣ Save private key to a local file
  const fileName = `hedera-account-${receipt.accountId}.txt`;
  fs.writeFileSync(fileName, newKey.toString());
  console.log(`Private key saved to file: ${fileName}`);

  // 6️⃣ Generate QR code for the private key
  const qrCodeData = await QRCode.toDataURL(newKey.toString());
  fs.writeFileSync(
    `hedera-account-${receipt.accountId}.png`,
    qrCodeData.split(",")[1],
    "base64"
  );
  console.log(`QR code saved as: hedera-account-${receipt.accountId}.png`);

  client.close();
}

main();
