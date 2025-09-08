import { startZombiFiGame , xpEarned} from "./game/game";
import {
  walletClient,
  publicClient,
  sonicTestnet,
} from "./blockchain/viemClient";
import { ZombiFiABI } from "./blockchain/ZombiFiABI";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

document.getElementById("startButton").addEventListener("click", async () => {
  await startZombiFiGame();
});

export function updateKillButton() {
  if (xpEarned > 0) {
    killZombieBtn.innerText = `Take XPs (${xpEarned} XP)`;
  } else {
    killZombieBtn.innerText = "Take XPs";
  }
}

const bg = document.createElement("div");
bg.classList.add("bg");
document.body.appendChild(bg);

const connectBtn = document.createElement("button");
connectBtn.classList.add("okl1");
connectBtn.innerText = "Connect Wallet";
bg.appendChild(connectBtn);

let connectedAccount = null;
let walletInfoDiv = null; // to keep ref for UI update

// Custom alert helper (already provided by you)
function showCustomAlert(message, time = 2000) {
  const existingAlert = document.querySelector(".custom-alert");
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement("div");
  alertDiv.classList.add("custom-alert");
  alertDiv.innerText = message;

  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translateX(-50%)";
  alertDiv.style.backgroundColor = "#333";
  alertDiv.style.color = "white";
  alertDiv.style.padding = "12px 24px";
  alertDiv.style.borderRadius = "8px";
  alertDiv.style.zIndex = "9999";
  alertDiv.style.fontFamily = "Arial, sans-serif";
  alertDiv.style.fontSize = "16px";
  alertDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  alertDiv.style.userSelect = "none";

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, time);
}

async function fetchXP(address) {
  try {
    const xp = await publicClient.readContract({
      address: contractAddress,
      abi: ZombiFiABI,
      functionName: "xp",
      args: [address],
    });
    return xp;
  } catch (e) {
    console.error("Failed to fetch XP:", e);
    return null;
  }
}

async function fetchPlayerWeapons(address, maxTokenId = 20) {
  const weapons = [];
  for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
    try {
      const weaponName = await publicClient.readContract({
        address: contractAddress,
        abi: ZombiFiABI,
        functionName: "getWeaponName",
        args: [tokenId],
      });
      if (weaponName && weaponName.length > 0) {
        weapons.push({ tokenId, name: weaponName });
      }
    } catch {
      continue;
    }
  }
  return weapons;
}

function spliceAddress(address) {
  if (!address || address.length < 10) return address;
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function showWalletInfo(address) {
  // Remove the connect button if it exists
  if (connectBtn.parentNode) connectBtn.remove();

  // Remove previous wallet info if exists
  if (walletInfoDiv) walletInfoDiv.remove();

  walletInfoDiv = document.createElement("div");
  walletInfoDiv.classList.add("wallet-info");

  const addrDiv = document.createElement("div");
  addrDiv.innerText = `Wallet: ${spliceAddress(address)}`;
  walletInfoDiv.appendChild(addrDiv);

  const xp = await fetchXP(address);
  const xpDiv = document.createElement("div");
  xpDiv.innerText = `XP: ${xp ?? "N/A"}`;
  walletInfoDiv.appendChild(xpDiv);

  const weapons = await fetchPlayerWeapons(address);
  const weaponsDiv = document.createElement("div");
  weaponsDiv.innerText = "Weapons:";
  walletInfoDiv.appendChild(weaponsDiv);

  if (weapons.length === 0) {
    const noneDiv = document.createElement("div");
    noneDiv.innerText = "No weapons minted yet.";
    walletInfoDiv.appendChild(noneDiv);
  } else {
    const ul = document.createElement("ul");
    weapons.forEach((weapon) => {
      const li = document.createElement("li");
      li.innerText = `#${weapon.tokenId}: ${weapon.name}`;
      ul.appendChild(li);
    });
    walletInfoDiv.appendChild(ul);
  }

  bg.appendChild(walletInfoDiv);
}

async function connectWallet() {
  try {
    if (typeof window.ethereum === "undefined") {
      showCustomAlert("MetaMask or compatible wallet is not installed.");
      return false;
    }

    const accounts = await walletClient.requestAddresses();
    if (accounts.length === 0) {
      showCustomAlert("No wallet accounts found.");
      return false;
    }
    connectedAccount = accounts[0];
    showCustomAlert("Wallet connected: " + spliceAddress(connectedAccount), 2000);
    await showWalletInfo(connectedAccount);
    return true;
  } catch (e) {
    console.error("Connection failed", e);
    showCustomAlert("Wallet connection failed.");
    return false;
  }
}

async function tryAutoReconnect() {
  // Check if wallet is already connected by requesting accounts silently
  if (typeof window.ethereum === "undefined") {
    return false;
  }
  try {
    const accounts = await walletClient.requestAddresses();
    if (accounts.length > 0) {
      connectedAccount = accounts[0];
      await showWalletInfo(connectedAccount);
      showCustomAlert("Wallet auto reconnected: " + spliceAddress(connectedAccount), 2000);
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Auto reconnect failed:", e);
    return false;
  }
}

// Listen for wallet events
if (window.ethereum && window.ethereum.on) {
  window.ethereum.on("disconnect", (error) => {
    console.warn("Wallet disconnected:", error);
    showCustomAlert("Wallet disconnected. Please reload the page.");
    connectedAccount = null;
    if (walletInfoDiv) walletInfoDiv.remove();
    // Show connect button again
    if (!document.body.contains(connectBtn)) bg.appendChild(connectBtn);
  });

  window.ethereum.on("accountsChanged", async (accounts) => {
    if (accounts.length === 0) {
      showCustomAlert("Wallet disconnected. Please connect your wallet.");
      connectedAccount = null;
      if (walletInfoDiv) walletInfoDiv.remove();
      if (!document.body.contains(connectBtn)) bg.appendChild(connectBtn);
    } else {
      connectedAccount = accounts[0];
      showCustomAlert(`Account changed: ${spliceAddress(connectedAccount)}`, 2000);
      await showWalletInfo(connectedAccount);
    }
  });

  window.ethereum.on("chainChanged", (chainId) => {
    showCustomAlert(`Network changed to ${parseInt(chainId, 16)}`, 2000);
  });
}

// Connect button handler
connectBtn.onclick = async () => {
  await connectWallet();
};

// Button for killing zombies (taking XP)
const killZombieBtn = document.createElement("button");
killZombieBtn.classList.add("okl");
killZombieBtn.innerText = "Take XPs";
bg.appendChild(killZombieBtn);

killZombieBtn.onclick = async () => {
  try {
    if (!connectedAccount) {
      showCustomAlert("Please connect your wallet first.");
      return;
    }

    if (xpEarned <= 0) {
      showCustomAlert("No XP earned yet. Kill some spiders first!");
      return;
    }

    const currentChainId = await walletClient.getChainId();
    if (currentChainId !== sonicTestnet.id) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${sonicTestnet.id.toString(16)}` }],
        });
      } catch (switchError) {
        showCustomAlert("Please switch to the Sonic Testnet in your wallet and try again.");
        return;
      }
    }

    await walletClient.writeContract({
      address: contractAddress,
      abi: ZombiFiABI,
      functionName: "rewardPlayer",
      args: [connectedAccount],
      account: connectedAccount,
    });

    showCustomAlert(`💀 ${xpEarned} XP rewarded!`, 1000);

    // Reset XP after rewarding
    // xpEarned = 0;
    updateKillButton();

    // Update the displayed XP after reward
    const updatedXP = await fetchXP(connectedAccount);
    if (walletInfoDiv) {
      const xpDiv = walletInfoDiv.querySelector("div:nth-child(2)");
      if (xpDiv) xpDiv.innerText = `XP: ${updatedXP ?? "N/A"}`;
    }
  } catch (err) {
    console.error("❌ Error:", err);
    showCustomAlert("Transaction failed.");
  }
};

// Try auto reconnect on page load
window.addEventListener("load", async () => {
  await tryAutoReconnect();
});
