import { GameState } from "../../core/GameState.js";
import "./ProfilePopup.css";
import { Assets } from "./Assets.js";

const ACHIEVEMENT_MAP = Assets.ACHIEVEMENTS;

const DEFAULT_WEAPONS = Assets.DEFAULT_WEAPONS;

const DEFAULT_ASSETS = Assets.DEFAULT_ASSETS;

export class ProfilePopup {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.player = GameState.data;
    this.Assets = new Assets();
  }

  setupPlayerData() {
    // Count each achievement
    const rawAchievements = GameState.data?.platformData?.achievements || [];
    const achievementCount = {};
    rawAchievements.forEach((id) => {
      if (ACHIEVEMENT_MAP[id]) {
        achievementCount[id] = (achievementCount[id] || 0) + 1;
      }
    });

    const playerWeapons = GameState.data?.weapons;

    if (!playerWeapons || playerWeapons.length === 0) {
      GameState.data.weapons = structuredClone(DEFAULT_WEAPONS);
    }

    if (!GameState.data.assets) {
      GameState.data.assets = structuredClone(DEFAULT_ASSETS);
    }

    // Unique + count mapped
    const uniqueIds = [
      ...new Set(rawAchievements.filter((id) => ACHIEVEMENT_MAP[id])),
    ];
    const mappedAchievements = uniqueIds.map((id) => ({
      ...ACHIEVEMENT_MAP[id],
      count: achievementCount[id],
    }));

    this.playerData = {
      name: GameState.data?.info?.name || "PlayerName123",
      pfp:
        GameState.data?.info?.pfp ||
        "https://www.arweave.net/qR_n1QvCaHqVTYFaTdnZoAXR6JBwWspDLtDNcLj2a5w?ext=png",
      description: GameState.data?.info?.description || "Skyreach Kingdom",
      level: GameState.data?.level || 27,
      xp: GameState.data?.xp || 4280,
      xpToNextLevel: 4280,
      currentXp: 3210,
      gold: 5240,
      gems: 42,
      starPoints: 18,
      achievements:
        mappedAchievements.length > 0
          ? mappedAchievements
          : [
              {
                name: "No Achievements Yet",
                icon: "../assets/images/badges/placeholder.svg",
                count: 0,
              },
            ],
      weapons: GameState.data.weapons,
      assets: GameState.data.assets,
      tasks: [
        { name: "Defeat the Ice Dragon", progress: 60, reward: "+500 XP" },
        {
          name: "Collect 10 Ancient Artifacts",
          progress: 30,
          reward: "+350 XP",
        },
        { name: "Complete Dark Forest Quest", progress: 80, reward: "+750 XP" },
      ],
      friends: [
        { name: "WarriorQueen", status: "online" },
        { name: "MageFire", status: "online" },
        { name: "ShadowHunter", status: "offline" },
        { name: "DragonRider", status: "offline" },
      ],
    };
  }

  show(container) {
    if (this.isVisible) return;
    this.isVisible = true;

    this.setupPlayerData();

    const wrapper = document.createElement("div");
    wrapper.className = "player-profile";
    wrapper.innerHTML = this.generateProfileHTML();

    this.element = wrapper;
    container.appendChild(wrapper);
  }

  hide() {
    if (!this.isVisible || !this.element) return;
    this.isVisible = false;

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  toggle(container) {
    if (this.isVisible) {
      GameState.game.controlsSystem?.requestPointerLock();
      this.hide();
    } else {
      document.exitPointerLock?.();
      this.show(container);
    }
  }

  generateProfileHTML() {
    return `<div class="profile-header">
                        <div class="avatar">
                            <img src="${
                              GameState.data?.info?.pfp
                            }" alt="Player Avatar" class="avatar-img" />
                        </div>
                        <div class="player-info">
                            <h1>${
                              GameState.data?.info?.name || "PlayerName123"
                            }</h1>
                            <p><i class="fas fa-map-marker-alt"></i> ${
                              GameState.data?.info?.bio || "Skyreach Kingdom"
                            }</p>
                            <span class="level-badge">Level ${
                              GameState.data?.level || 27
                            }</span>
                        </div>
                    </div>

                    <div class="profile-content">
                        <div class="left-column">
                            <div class="panel">
                                <h2><i class="fas fa-chart-line"></i> Stats & Progress</h2>
                                <div class="stats">
                                    <div class="stat-item">
                                        <i class="fas fa-fire"></i>
                                        <div class="stat-value">${GameState.data?.platformData?.xp?.toLocaleString()}</div>
                                        <div class="stat-label">XP Points</div>
                                    </div>
                                    <div class="stat-item">
                                        <i class="fas fa-trophy"></i>
                                        <div class="stat-value">${
                                          this.playerData.level
                                        }</div>
                                        <div class="stat-label">Player Level</div>
                                    </div>
                                </div>
                                <div class="xp-bar">
                                    <div class="xp-progresss" style="width: ${
                                      (GameState.data?.platformData?.xp /
                                        this.playerData.xpToNextLevel) *
                                      100
                                    }%"></div>
                                </div>
                                <div class="xp-text">${GameState.data?.platformData?.xp?.toLocaleString()}/${this.playerData.xpToNextLevel.toLocaleString()} XP to Level ${
      this.playerData.level + 1
    }</div>
                            </div>

                            <div class="panel">
                                <h2><i class="fas fa-tasks"></i> Current Tasks</h2>
                                ${this.playerData.tasks
                                  .map(
                                    (task) => `
                                    <div class="task-item">
                                        <div class="task-info">
                                            <div class="task-name">${task.name}</div>
                                            <div class="task-progress">
                                                <div class="task-progress-bar" style="width: ${task.progress}%"></div>
                                            </div>
                                        </div>
                                        <div class="task-reward">${task.reward}</div>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>

                            <div class="panel">
                            <h2><i class="fas fa-award"></i> Achievements</h2>
                            <div class="achievements-grid">
                            ${
                              this.playerData.achievements.length === 1 &&
                              this.playerData.achievements[0].name ===
                                "No Achievements Yet"
                                ? `<div class="achievement">
                                    <div class="achievement-icon"><img src="${this.playerData.achievements[0].icon}"></div>
                                    <div class="achievement-name">${this.playerData.achievements[0].name}</div>
                                    </div>`
                                : this.playerData.achievements
                                    .map(
                                      (achievement) => `
                                        <div class="achievement">
                                            <div class="achievement-icon"><img src="${achievement.icon}"></div>
                                            <div class="achievement-name">
                                            ${achievement.name}
                                            <span class="achievement-count">x${achievement.count}</span>
                                            </div>
                                        </div>
                                        `
                                    )
                                    .join("")
                            }
                            </div>
                        </div>

                        </div>

                        <div class="right-column">
                            <div class="panel">
                                <h2><i class="fas fa-coins"></i> Currency</h2>
                                <div class="currency">
                                    <div class="currency-item">
                                        <div class="currency-icon"><img src="../assets/images/badges/metal-bar.svg"></div>
                                        <div class="currency-amount">${this.playerData.gold.toLocaleString()}</div>
                                        <div class="currency-name">Gold</div>
                                    </div>
                                    <div class="currency-item">
                                        <div class="currency-icon"><img src="../assets/images/badges/rupee.svg"></div>
                                        <div class="currency-amount">${
                                          this.playerData.gems
                                        }</div>
                                        <div class="currency-name">Gems</div>
                                    </div>
                                    <div class="currency-item">
                                        <div class="currency-icon"><img src="../assets/images/badges/coins.svg"></div>
                                        <div class="currency-amount">${
                                          this.playerData.starPoints
                                        }</div>
                                        <div class="currency-name">Points</div>
                                    </div>
                                </div>
                            </div>

                            <div class="panel">
                                <h2><i class="fas fa-shield-alt"></i> Weapons</h2>
                                <div class="weapons-list">
                                    ${this.playerData.weapons
                                      .map(
                                        (weapon) => `
                                        <div class="weapon">
                                            <div class="weapon-icon"><img src="../assets/images/badges/${weapon.icon}.svg"></div>
                                            <div class="weapon-info">
                                            <div class="weapon-level">Level: ${weapon.level}</div>
                                            <div class="weapon-name">${weapon.name}</div>
                                            <div class="weapon-stats">${weapon.stat}</div>
                                            </div>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <div class="panel">
                                <h2><i class="fas fa-cubes"></i> Assets</h2>
                                <div class="assets-grid">
                                    ${this.playerData.assets
                                      .map(
                                        (asset) => `
                                        <div class="asset asse">
                                            <div class="asset-icon"><img src="../assets/images/badges/${asset.icon}.svg"></div>
                                            <div class="asset-info">
                                                <div class="asset-name">${asset.name}</div>
                                                <div class="asset-count">${asset.count}</div>
                                            </div>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <div class="panel">
                                <h2><i class="fas fa-users"></i> Friends</h2>
                                <div class="friends-list">
                                    ${this.playerData.friends
                                      .map(
                                        (friend) => `
                                        <div class="friend">
                                            <div class="friend-avatar"><i class="fas fa-user"></i></div>
                                            <div class="friend-name">${
                                              friend.name
                                            }</div>
                                            <span class="friend-status status-${
                                              friend.status
                                            }">${
                                          friend.status === "online"
                                            ? "Online"
                                            : "Offline"
                                        }</span>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
  }
}
