# zombifi
🧟‍♂️ zombifi

A horror FPS RPG where you venture through a sinister medical facility to save your daughter, Gladys, from a nightmare experiment gone wrong. Face terrifying mutated zombies, uncover secrets, and complete missions recorded permanently on Hedera through NFTs that capture your progress, assets, and achievements.

🎮 Live Demo

https://github.com/Victor28012001/zombifi

🎥 Demo Video

🎯 Game Concept

In zombifi, you play as a desperate father navigating an 8-floor medical research facility, where an experiment has turned staff and test subjects into deadly mutants — Lurkers and Screamers.

Your mission: save Gladys and survive by collecting critical test samples, completing objectives, and battling horrors that lurk in the dark.

The game integrates the Hedera NFT system to record your mission progress, assets, and player milestones directly on-chain — creating a verifiable, player-owned history. Each player’s actions, achievements, and loyalty are tied to their unique on-chain identity.

🌌 Core Features

8 Unique Levels — Each floor introduces new threats and mission types

Mission System — Collect samples, unlock secure areas, and uncover the truth

On-Chain Progression (Hedera) — XP, achievements, and assets are stored immutably as NFTs

Loyalty System — Earn tiered NFT badges for dedication and milestones

Horror FPS Gameplay — Intense survival combat with mutants and limited resources

3D Immersive Environment — Fully interactive, WebGL-powered facility built in Three.js

Wallet Integration — Connect your Hedera-compatible wallet to manage your identity and collectibles

🧩 Missions & Objectives

Sample Collection — Retrieve DNA or blood samples crucial to reversing the mutation

Facility Navigation — Unlock security systems and progress through restricted areas

Survival Challenges — Conserve ammo and craft makeshift weapons to fight Lurkers and Screamers

Rescue Gladys — Reach the final lab and decide how far you’ll go to save her

Each mission’s outcome and completion record is minted as a unique Mission NFT on Hedera.

🎮 Progression & Rewards System
On-Chain Progression

Earn XP by completing missions and side objectives

XP, inventory, and mission NFTs are stored directly on the Hedera network

Each mission is a digital collectible representing your story’s progress

Loyalty Tiers (NFT-Based)
Tier	XP Required	NFT Reward
Rookie	0	Starter access pass
Veteran	1000	Exclusive weapon skin
Legend	5000	Special ability NFT

Players climb loyalty tiers by completing missions, maintaining daily streaks, and earning unique on-chain rewards.
Tier NFTs unlock visual cosmetics and gameplay bonuses within the game.

🏗️ Architecture Overview
Frontend

Built with HTML, CSS, JavaScript, and Vite

Real-time 3D rendering using Three.js

FPS controls, animations, and event-driven mission system

Hedera Wallet Integration (e.g., HashPack or Blade Wallet)

Backend

Node.js + Express server managing player sessions, missions, and progress

Integrates with the Hedera SDK for minting and updating NFTs tied to mission outcomes

API endpoints for player XP, NFT creation, and mission state tracking

Blockchain Integration

Hedera Token Service (HTS) for NFTs representing mission progress, achievements, and assets

Hedera Consensus Service (HCS) for event validation and transparent mission updates

Wallet Integration: HashPack / Blade / MetaMask (via HashConnect)

🚀 Getting Started
Prerequisites Frontend

Node.js 18+

npm or yarn

A Hedera-compatible wallet (HashPack or Blade)

Local Development
# Clone repository
git clone https://github.com/Victor28012001/zombifi
cd zombifi

# Install dependencies
npm install

# Setup environment variables
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_ACCOUNT_ID=your-account-id
VITE_HEDERA_PRIVATE_KEY=your-private-key
VITE_DEFAULT_METADATA_URI=https://your-metadata-uri.com/default-pass.json

# Run development server
npm run dev


Access locally at: http://localhost:5173

🛠️ Backend Setup (Hedera Integration)

Backend repo:
🔗 https://github.com/Victor28012001/zombifi/server

Prerequisites

Node.js 18+

Access to Hedera testnet account

.env file configured with:

PORT=4000
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
FRONTEND_URL=http://localhost:5173

Run Backend
git clone https://github.com/Victor28012001/zombifi.git
cd zombifi
npm install
npm start

🔧 Technical Implementation
Minting Mission NFTs
const { TokenCreateTransaction } = require("@hashgraph/sdk");

async function mintMissionNFT(name, description) {
  const tx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol("BBG")
    .setTokenType(1) // Non-fungible
    .setSupplyType(1)
    .setMaxSupply(10000)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  return receipt.tokenId;
}

Updating Player Progress
async function awardXP(playerId, missionId, xp) {
  // Update player progress in backend + issue NFT metadata update
  await hederaService.updateNFTMetadata(missionId, { xpAwarded: xp, timestamp: Date.now() });
}

🤝 Contributing

We welcome contributions!
Feel free to open issues, submit pull requests, or propose new missions and storylines.

# Certification link
https://claim.hashgraphdev.com/certification?oneTimeCode=05d887c0-9534-11f0-8004-731714d16728

# Pitch Link
https://www.canva.com/design/DAG3YXqBHAM/cypks8dfLgdqosHPSN9onw/view?utm_content=DAG3YXqBHAM&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=ha6c76f3f0e

🧱 Built For

The Hedera Game Jam — showcasing how narrative-driven web3 games can use Hedera NFTs to create permanent, player-owned stories.

🧠 Summary

zombifi fuses horror storytelling, FPS survival gameplay, and blockchain permanence into one emotional experience.
Every fight, choice, and achievement is recorded forever on Hedera — turning your journey into a digital legacy.