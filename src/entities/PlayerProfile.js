import { hederaNFTService } from "../utils/hederaNFTService.js";

const DEFAULT_AVATAR = "https://www.arweave.net/qR_n1QvCaHqVTYFaTdnZoAXR6JBwWspDLtDNcLj2a5w?ext=png";

export class PlayerProfile {
  constructor() {
    this.currentProfile = {
      address: null,
      info: {
        name: "Guest",
        bio: "",
        pfp: DEFAULT_AVATAR,
      },
      stats: {
        healthBoost: 0,
        energyBoost: 0,
        strengthBoost: 0,
        speedBoost: 0,
        energyEfficiency: 0,
        energyCapacity: 0,
        damageBoost: 0,
        xpBoost: 0,
      },
      xp: 0,
      achievements: [],
      levelsClaimed: [],
    };
    this.currentTier = "Rookie";
    this.loadFromStorage();
  }
  
  loadFromStorage() {
    const saved = localStorage.getItem('playerProfile');
    if (saved) {
      this.currentProfile = JSON.parse(saved);
    }
  }
  
  saveToStorage() {
    localStorage.setItem('playerProfile', JSON.stringify(this.currentProfile));
  }

  async setProfile(profileData) {
    if (!profileData) {
      console.warn("Attempted to set null profile");
      return;
    }

    this.currentProfile = {
      address: profileData.address || null,
      info: {
        name: profileData.info?.name || "Unnamed",
        bio: profileData.info?.bio || "",
        pfp: profileData.info?.pfp || DEFAULT_AVATAR,
      },
      stats: {
        ...this.currentProfile?.stats,
        ...(profileData.stats || {}),
      },
      xp: Number(profileData.xp) || 0,
      achievements: profileData.achievements || [],
      levelsClaimed: profileData.levelsClaimed || [],
    };
    this.saveToStorage();
  }

  async updateXP(amount) {
    try {
      this.currentProfile.xp += amount;
      const previousTier = this.currentTier;
      const upgraded = await this.checkTierUpgrade();

      return {
        success: true,
        upgraded,
        previousTier,
        newTier: this.currentTier,
      };
    } catch (error) {
      console.error("XP update failed:", error);
      return { success: false, error };
    }
  }

  async checkTierUpgrade() {
    try {
      const xp = this.currentProfile.xp;
      const newTier = this.calculateCurrentTier(xp);

      if (newTier !== this.currentTier) {
        this.currentTier = newTier;
        
        // Award NFT for tier upgrade if wallet is connected
        if (hederaNFTService.isConnected()) {
          try {
            await hederaNFTService.mintGameNFT(
              "tier_upgrade", 
              xp, 
              null, 
              { tier: newTier }
            );
          } catch (error) {
            console.warn("Failed to mint tier upgrade NFT:", error);
          }
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Tier check failed:", error);
      return false;
    }
  }

  calculateCurrentTier(xp) {
    if (xp >= 5000) return "Legend";
    if (xp >= 1000) return "Veteran";
    return "Rookie";
  }

  async addAchievement(achievement) {
    console.log("Adding achievement:", achievement);
    try {
      if (!achievement?.name) {
        throw new Error("Invalid achievement: missing name");
      }

      if (!this.currentProfile.achievements) {
        this.currentProfile.achievements = [];
      }
      if (!this.currentProfile.levelsClaimed) {
        this.currentProfile.levelsClaimed = [];
      }

      // Prevent duplicate achievements by name
      if (this.currentProfile.achievements.some(a => a.name === achievement.name)) {
        console.log("Achievement already added:", achievement.name);
        return false;
      }

      let xpToAward = 0;
      // Award XP only once per level completed
      const lvlMatch = achievement.name.match(/^Level (\d+) Completed$/);
      if (lvlMatch) {
        const levelNumber = Number(lvlMatch[1]);
        if (!this.currentProfile.levelsClaimed.includes(levelNumber)) {
          xpToAward = 100; // Example XP amount per level
          this.currentProfile.levelsClaimed.push(levelNumber);
        }
      }

      this.currentProfile.achievements.push(achievement);
      this.applyStatImprovements(achievement);

      // Award XP for achievement
      if (xpToAward > 0) {
        await this.updateXP(xpToAward);
      }

      // Mint NFT for significant achievements if wallet is connected
      if (hederaNFTService.isConnected() && this.isSignificantAchievement(achievement)) {
        try {
          await hederaNFTService.mintGameNFT(
            "achievement", 
            xpToAward, 
            null, 
            { achievement: achievement.name }
          );
        } catch (error) {
          console.warn("Failed to mint achievement NFT:", error);
        }
      }

      this.saveToStorage();
      console.log("✅ Achievement added:", achievement.name);

      return true;
    } catch (error) {
      console.error("Error adding achievement:", error);
      throw error;
    }
  }

  isSignificantAchievement(achievement) {
    const significantAchievements = [
      "Game Completed",
      "Speed Runner", 
      "Flawless Victory",
      "Sharpshooter"
    ];
    return significantAchievements.includes(achievement.name);
  }

  storeLocalAchievement(achievement) {
    try {
      let localAchievements;
      try {
        const stored = localStorage.getItem("localAchievements");
        localAchievements = stored ? JSON.parse(stored) : [];
      } catch (e) {
        localAchievements = [];
      }

      localAchievements.push(achievement);
      localStorage.setItem("localAchievements", JSON.stringify(localAchievements));
    } catch (error) {
      console.error("Failed to store achievement locally:", error);
      if (!this._localAchievementsFallback) {
        this._localAchievementsFallback = [];
      }
      this._localAchievementsFallback.push(achievement);
    }
  }

  async syncLocalAchievements() {
    const localAchievements = JSON.parse(
      localStorage.getItem("localAchievements") || "[]"
    );
    if (localAchievements.length === 0) return true;

    try {
      for (const achievement of localAchievements) {
        await this.addAchievement(achievement);
      }
      localStorage.removeItem("localAchievements");
      return true;
    } catch (error) {
      console.error("Failed to sync local achievements:", error);
      return false;
    }
  }

  applyStatImprovements(achievement) {
    if (!achievement?.name) return;

    this.currentProfile.stats = {
      healthBoost: 0,
      energyBoost: 0,
      strengthBoost: 0,
      speedBoost: 0,
      energyEfficiency: 0,
      energyCapacity: 0,
      damageBoost: 0,
      xpBoost: 0,
      ...(this.currentProfile.stats || {}),
    };

    const stats = this.currentProfile.stats;

    switch (achievement.name) {
      case "Game Completed":
        stats.healthBoost += 10;
        stats.strengthBoost += 5;
        break;

      case "Speed Runner":
        stats.speedBoost += 0.05;
        break;

      case "Flawless Victory":
        stats.healthBoost += 10;
        break;

      case "Energy Efficient":
        stats.energyEfficiency += 0.1;
        stats.energyCapacity += 10;
        break;

      case "Sharpshooter":
        stats.damageBoost += 0.05;
        break;

      case "Pacifist":
        stats.energyCapacity += 10;
        break;

      default:
        if (achievement.name.startsWith("Level ") && achievement.name.includes("Completed")) {
          stats.xpBoost += 5;
        }
        break;
    }
  }

  getPlayerStats() {
    const stats = this.currentProfile.stats || {};
    return {
      health: 100 + (stats.healthBoost || 0),
      energy: 100 + (stats.energyCapacity || 0),
      strength: 100 + (stats.strengthBoost || 0),
      walkSpeed: 0.1 + (stats.speedBoost || 0),
      runSpeed: 0.2 + (stats.speedBoost || 0),
      sprintSpeed: 0.4 + (stats.speedBoost || 0),
      energyDrainRate: Math.max(0.1, 0.5 - (stats.energyEfficiency || 0)),
      energyRegenRate: 0.2 + (stats.energyEfficiency || 0) * 0.05,
      damageMultiplier: 1 + (stats.damageBoost || 0),
    };
  }

  getProfileData() {
    return {
      ...this.currentProfile,
      tier: this.currentTier,
      isHederaConnected: hederaNFTService.isConnected(),
      hederaAccount: hederaNFTService.getAccountId()
    };
  }
}

export const playerProfileInstance = new PlayerProfile();