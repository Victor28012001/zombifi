import { GameState } from "../../core/GameState.js";
import axios from "axios";

export class ProfileHelpers {
  getDefaultAvatar() {
    return "https://www.arweave.net/qR_n1QvCaHqVTYFaTdnZoAXR6JBwWspDLtDNcLj2a5w?ext=png";
  }

  formatHederaAccountId(accountId) {
    return accountId && accountId.length >= 8
      ? `${accountId.slice(0, 6)}...${accountId.slice(-4)}`
      : "Connect Hedera Wallet";
  }

  // Local profile management (no chain integration)
  async fetchLocalProfiles() {
    // For Hedera, we'll use local profiles or create from Hedera account
    const savedProfile = localStorage.getItem('playerProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      return [this.createLocalProfile(profileData)];
    }
    return [this.createDefaultProfile()];
  }

  createLocalProfile(profileData) {
    return {
      name: profileData.info?.name || "Local Player",
      description: profileData.info?.bio || "Local game profile",
      image: profileData.info?.pfp || this.getDefaultAvatar(),
      chosen: true,
      isChainProfile: false,
      stats: profileData.stats || this.getDefaultStats(),
      xp: profileData.xp || 0,
      achievements: profileData.achievements || [],
    };
  }

  getDefaultStats() {
    return {
      healthBoost: 0,
      energyBoost: 0,
      strengthBoost: 0,
      speedBoost: 0,
      energyEfficiency: 0,
      energyCapacity: 0,
      damageBoost: 0,
      xpBoost: 0,
    };
  }

  createDefaultProfile() {
    return {
      name: "Default",
      description: "Create your game profile",
      image: this.getDefaultAvatar(),
      chosen: true,
      isChainProfile: false,
      disabled: false,
      xp: 0,
      achievements: [],
      stats: this.getDefaultStats()
    };
  }

  getTierDisplayInfo(xp) {
    const xpNumber = Number(xp) || 0;
    if (xpNumber >= 5000) return { tier: "Legend", percent: 100 };
    if (xpNumber >= 1000) {
      return {
        tier: "Veteran",
        percent: Math.min(100, ((xpNumber - 1000) / 4000) * 100),
      };
    }
    return { tier: "Rookie", percent: Math.min(100, (xpNumber / 1000) * 100) };
  }

  createXPBadge(profile) {
    return `<div class="xp-badge">${profile.xp} XP</div>`;
  }

  createTierBadge(tierInfo) {
    return `
      <div class="tier-badge ${tierInfo.tier.toLowerCase()}">
        ${tierInfo.tier}
      </div>
    `;
  }

  createXPProgress(profile, tierInfo) {
    return `
      <div class="xp-progress">
        <div class="progress-bar" style="width: ${tierInfo.percent}%"></div>
        <span id="xp">${profile.xp || 0} XP</span>
      </div>
    `;
  }

  createCornerDivs(baseClass) {
    return Array.from({ length: 4 }, (_, i) => 
      `<div class="${baseClass}${i + 1}"></div>`
    ).join("");
  }

  async uploadToIPFS(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `https://aquamarine-working-thrush-698.mypinata.cloud/ipfs/${ipfsHash}`;
  }

  // For Hedera, we'll create local profiles instead of on-chain
  async createLocalProfileFromData(name, desc, imageUrl) {
    const profileData = {
      info: {
        name: name,
        bio: desc,
        pfp: imageUrl || this.getDefaultAvatar(),
      },
      stats: this.getDefaultStats(),
      xp: 0,
      achievements: [],
      levelsClaimed: [],
    };

    // Save to localStorage
    localStorage.setItem('playerProfile', JSON.stringify(profileData));
    
    return {
      success: true,
      profile: this.createLocalProfile(profileData)
    };
  }

  showMessage(root, title, text, duration = 1500) {
    this.clearMessage();

    const container = document.createElement("div");
    container.id = "game-message-container";
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;

    container.innerHTML = `
      <h2 style="margin: 0 0 10px 0; font-size: 2em; color: #4CAF50;">${title}</h2>
      <p style="margin: 0; font-size: 1.2em;">${text}</p>
    `;

    root.appendChild(container);
    container.style.opacity = "1";

    this.messageTimeout = setTimeout(() => {
      this.clearMessage();
    }, duration);
  }

  showError(root, title, message) {
    this.showMessage(root, title, message, 3000);

    const container = document.getElementById("game-message-container");
    if (container) {
      const titleElement = container.querySelector("h2");
      if (titleElement) {
        titleElement.style.color = "#f44336";
      }
    }
  }

  clearMessage() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }

    const container = document.getElementById("game-message-container");
    if (container) {
      container.style.opacity = "0";
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    }
  }
}