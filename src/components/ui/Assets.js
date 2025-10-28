export class Assets {
  // Achievements with their name and icon path
  static ACHIEVEMENTS = {
    0: {
      name: "Game Completed",
      icon: "../assets/images/badges/game-completed.svg",
    },
    1: {
      name: "Speed Runner",
      icon: "../assets/images/badges/speed-runner.svg",
    },
    2: {
      name: "Flawless Victory",
      icon: "../assets/images/badges/flawless-victory.svg",
    },
    3: {
      name: "Energy Efficient",
      icon: "../assets/images/badges/energy-efficient.svg",
    },
    4: {
      name: "Sharpshooter",
      icon: "../assets/images/badges/sharp-shooter.svg",
    },
    5: { name: "Pacifist", icon: "../assets/images/badges/pacifist.svg" },
    6: {
      name: "Level 1 Completed",
      icon: "../assets/images/badges/level-1.svg",
    },
    7: {
      name: "Level 2 Completed",
      icon: "../assets/images/badges/level-2.svg",
    },
    8: {
      name: "Level 3 Completed",
      icon: "../assets/images/badges/level-3.svg",
    },
    9: {
      name: "Level 4 Completed",
      icon: "../assets/images/badges/level-4.svg",
    },
    10: {
      name: "Level 5 Completed",
      icon: "../assets/images/badges/level-5.svg",
    },
    11: {
      name: "Level 6 Completed",
      icon: "../assets/images/badges/level-6.svg",
    },
    12: {
      name: "Level 7 Completed",
      icon: "../assets/images/badges/level-7.svg",
    },
    13: {
      name: "Level 8 Completed",
      icon: "../assets/images/badges/level-8.svg",
    },
  };

  // Default starting weapons
  static DEFAULT_WEAPONS = [
    {
      id: "knife",
      name: "Combat Knife",
      icon: "bowie-knife",
      stat: "Damage: 25",
      upgraded: false,
      level: 1,
      damage: 40,
      weight: 5,
      upgradeCost: { xp: 100, gold: 50 },
    },
    {
      id: "gun",
      name: "Handgun",
      icon: "ak47u",
      stat: "Damage: 40",
      upgraded: false,
      level: 1,
      damage: 25,
      weight: 10,
      upgradeCost: { xp: 100, gold: 50 },
    },
  ];

  // Default assets/items
  static DEFAULT_ASSETS = [
    {
      id: "medkits",
      name: "Medkits",
      icon: "medical-pack",
      description: "Restores 50 HP when used.",
      type: "consumable",
      quantity: 2,
      weight: 1,
      rarity: "common",
      stackable: true,
      maxStack: 5,
      durability: null,
      cooldown: 10,
      tags: ["healing"],
    },
    {
      id: "ammo-packs",
      name: "Ammo Packs",
      icon: "ammo-box",
      description: "Provides 30 rounds of ammunition.",
      type: "consumable",
      quantity: 3,
      weight: 1,
      rarity: "common",
      stackable: true,
      maxStack: 5,
      durability: null,
      cooldown: 5,
      tags: ["ammunition"],
    },
    {
      id: "lockpicks",
      name: "Lockpicks",
      icon: "key-card",
      description: "Used to unlock doors and safes.",
      type: "tool",
      quantity: 1,
      weight: 1,
      rarity: "uncommon",
      stackable: true,
      maxStack: 3,
      durability: null,
      cooldown: 0,
      tags: ["tool"],
    },
    {
      id: "security-cards",
      name: "Security Cards",
      icon: "key-card",
      description: "Grants access to secure areas.",
      type: "key",
      quantity: 0,
      weight: 1,
      rarity: "rare",
      stackable: true,
      maxStack: 1,
      durability: null,
      cooldown: 0,
      tags: ["key", "corporation", "government"],
    },
    {
      id: "night-vision",
      name: "Night Vision Goggles",
      icon: "steampunk-goggles",
      description: "Allows you to see in the dark.",
      type: "equipment",
      quantity: 0,
      weight: 1,
      rarity: "rare",
      stackable: true,
      maxStack: 1,
      durability: null,
      cooldown: 0,
      tags: ["equipment"],
    },
    {
      id: "intel-files",
      name: "Intel Files",
      icon: "encrypted-channel",
      description: "Contains valuable information.",
      type: "document",
      quantity: 0,
      weight: 1,
      rarity: "epic",
      stackable: true,
      maxStack: 1,
      durability: null,
      cooldown: 0,
      tags: ["document", "intel", "agency"],
    },
  ];

  static AVAILABLE_WEAPONS = [
    {
      id: "bow",
      name: "Windforce Bow",
      icon: "bow-arrow",
      damage: 60,
      cost: { xp: 500 },
    },
    {
      id: "staff",
      name: "Arcane Staff",
      icon: "hat-wizard",
      damage: 80,
      cost: { xp: 800 },
    },
    {
      id: "sword",
      name: "Dragon Slayer",
      icon: "sword",
      damage: 100,
      cost: { xp: 1000 },
    },
  ];
}
