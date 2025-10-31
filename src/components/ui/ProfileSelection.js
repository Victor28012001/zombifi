import { GameState } from "../../core/GameState.js";
import { playerProfileInstance } from "../../entities/PlayerProfile.js";
import { ProfileHelpers } from "../helpers/profileHelpers.js";
import { hederaNFTService } from "../../utils/hederaNFTService.js";

export class ProfileSelection {
  constructor(root) {
    this.root = root;
    this.profiles = [];
    this.selectedProfileIndex = null;
    this.hederaConnected = false;
    this.messageTimeout = null;
    this.helpers = new ProfileHelpers();
  }

  async show(game) {
    const hederaAccountId = hederaNFTService.getAccountId();
    const displayAccountId = this.helpers.formatHederaAccountId(hederaAccountId);

    // Load local profiles
    this.profiles = await this.helpers.fetchLocalProfiles();

    // Set the first profile as active in GameState
    if (this.profiles.length > 0) {
      playerProfileInstance.setProfile(this.profiles[0]);
    }

    // Render UI
    this.root.innerHTML = this.createProfileHTML(displayAccountId);
    this.addEventListeners(game);
    this.setupHederaEventListener();
  }

  createNFTCollectionUI() {
    return `
      <div class="nft-collection-section">
        <h3>Your Game NFTs</h3>
        <div class="wallet-connection">
          <button id="connectHederaBtn" class="hedera-connect-btn">
            ${hederaNFTService.isConnected() ? 
              `Connected: ${hederaNFTService.getAccountId()}` : 
              'Connect Hedera Wallet'}
          </button>
          ${hederaNFTService.isConnected() ? 
            '<button id="disconnectHederaBtn" class="hedera-disconnect-btn">Disconnect</button>' : 
            ''}
        </div>
        <div id="nftCollection" class="nft-grid">
          <!-- NFTs will be loaded here -->
        </div>
      </div>
    `;
  }

  async loadUserNFTs() {
    const nftContainer = document.getElementById('nftCollection');
    if (!nftContainer) return;

    if (!hederaNFTService.isConnected()) {
      nftContainer.innerHTML = '<p class="no-nfts">Connect your Hedera wallet to view NFTs</p>';
      return;
    }

    nftContainer.innerHTML = '<p class="loading">Loading NFTs...</p>';

    try {
      const nfts = await hederaNFTService.getUserNFTs();
      
      if (nfts.length === 0) {
        nftContainer.innerHTML = '<p class="no-nfts">No NFTs yet. Complete levels to earn rewards!</p>';
        return;
      }

      nftContainer.innerHTML = nfts.map(nft => `
        <div class="nft-card">
          <img src="${nft.image}" alt="${nft.name}" class="nft-image" />
          <div class="nft-info">
            <h4>${nft.name}</h4>
            <p>${nft.description}</p>
            <div class="nft-attributes">
              ${(nft.attributes || []).map(attr => `
                <span class="attribute">${attr.trait_type}: ${attr.value}</span>
              `).join('')}
            </div>
            <div class="nft-serial">Serial: #${nft.serial}</div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      nftContainer.innerHTML = '<p class="error">Failed to load NFTs</p>';
      console.error("Error loading NFTs:", error);
    }
  }

  addNFTEventListeners() {
    const connectBtn = document.getElementById('connectHederaBtn');
    const disconnectBtn = document.getElementById('disconnectHederaBtn');

    if (connectBtn) {
      connectBtn.addEventListener('click', async () => {
        if (!hederaNFTService.isConnected()) {
          try {
            await hederaNFTService.connectWallet();
            this.loadUserNFTs();
            // Update button text
            connectBtn.textContent = `Connected: ${hederaNFTService.getAccountId()}`;
          } catch (error) {
            console.error("Failed to connect wallet:", error);
          }
        }
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', async () => {
        await hederaNFTService.disconnectWallet();
        this.loadUserNFTs();
        const connectBtn = document.getElementById('connectHederaBtn');
        if (connectBtn) {
          connectBtn.textContent = 'Connect Hedera Wallet';
        }
      });
    }
  }

  setupHederaEventListener() {
    // Listen for wallet connection changes
    window.addEventListener('hedera-wallet-connected', () => {
      this.loadUserNFTs();
      const connectBtn = document.getElementById('connectHederaBtn');
      if (connectBtn) {
        connectBtn.textContent = `Connected: ${hederaNFTService.getAccountId()}`;
      }
      // Refresh the profile view to show updated connection status
      this.show(GameState.game);
    });

    window.addEventListener('hedera-wallet-disconnected', () => {
      this.loadUserNFTs();
      const connectBtn = document.getElementById('connectHederaBtn');
      if (connectBtn) {
        connectBtn.textContent = 'Connect Hedera Wallet';
      }
      // Refresh the profile view
      this.show(GameState.game);
    });
  }

  createProfileHTML(displayAccountId) {
    const createCornerDivs = (baseClass) =>
      Array.from(
        { length: 4 },
        (_, i) => `<div class="${baseClass}${i + 1}"></div>`
      ).join("");

    return `
      <div class="main" id="main-profile">
        <div class="mainTitle"><span>Choose Or Create Profile</span></div>
        ${this.createProfileRadios()}
        <div class="menuOpenBtns">
          ${createCornerDivs("corner")}
          <div class="topHeadingDiv">
            <p>Connect Hedera Wallet to earn NFT rewards</p>
            <div class="flex-button" id="flex-buttons">
              <button id="connectHederaBtn">${displayAccountId}</button>
            </div>
          </div>
          <div class="selectionBtns">
            ${this.profiles
              .map((profile, i) => this.createProfileButton(profile, i))
              .join("")}
          </div>
        </div>

        ${this.createNFTCollectionUI()}

        <div class="overlay"></div>

        <div class="menuWrapper">
          ${createCornerDivs("corner")}
          <div class="menu">
            <div class="topHeadingDiv">
              <span style="padding-left: 1.5em;">Are you sure you want to choose this option?</span>
            </div>
            <div class="middleDiv">
              <span style="padding-left: 1.5em;">Or Create a new Profile?</span>
              ${this.createProfileForm()}
            </div>
            <div class="bottomDiv">
              <div class="buttons">
                ${this.createYesNoButton("yesCheck", "yes", "Yes")}
                ${this.createYesNoButton("noCheck", "no", "No")}
              </div>
            </div>
          </div>
        </div>
        <div id="bottom-button">
          <button id="bottom-btn">Continue to Game</button>
        </div>
      </div>
    `;
  }

  createProfileRadios() {
    return (
      this.profiles
        .map(
          (_, i) =>
            `<input type="radio" name="toggle" class="open" id="open${i}" hidden />`
        )
        .join("") +
      `
      <input type="radio" name="toggle" id="yesCheck" class="yesCheck" hidden />
      <input type="radio" name="toggle" id="noCheck" class="noCheck" hidden />
    `
    );
  }

  createProfileButton(profile, index) {
    const imageUrl = profile.image || this.helpers.getDefaultAvatar();
    const tierInfo = this.helpers.getTierDisplayInfo(profile.xp || 0);

    return `
      <label for="open${index}" class="open profile-btn" data-index="${index}" tabindex="0">
        <div class="profile-container">
          <div class="avatar-container">
            <img src="${imageUrl}" alt="${profile.name}" class="profile-img ${
      profile.chosen ? "chosen" : ""
    }" onerror="this.src='${this.helpers.getDefaultAvatar()}'" />
            ${this.helpers.createXPBadge(profile)}
            ${this.helpers.createTierBadge(tierInfo)}
          </div>
          <span class="profile-name">${profile.name}</span>
          ${this.helpers.createXPProgress(profile, tierInfo)}
        </div>
        ${this.helpers.createCornerDivs("cornerCBtn")}
      </label>
    `;
  }

  createProfileForm() {
    return `
      <form id="customProfileForm" class="custom-profile-form">
        <label class="image-upload">
          <input type="file" accept="image/*" id="profileImageInput" />
          <div class="image-preview"></div>
        </label>
        <div id="inputs">
          <input type="text" id="profileName" placeholder="Enter name" required />
          <textarea id="profileDesc" placeholder="Enter description"></textarea>
          <button type="submit">Create Profile</button>
        </div>
      </form>
    `;
  }

  createYesNoButton(id, className, text) {
    return `
      <label for="${id}" class="${className}" tabindex="1">
        <input type="radio" class="${id}" />
        <span>${text}</span>
        ${this.helpers.createCornerDivs(
          `cornerBtn${className === "yes" ? "1" : "2"}`
        )}
      </label>
    `;
  }

  addEventListeners(game) {
    const profileBtns = document.querySelectorAll(".profile-btn");
    const yesNoLabels = document.querySelectorAll("label.yes, label.no");
    const continueBtn = document.getElementById("bottom-btn");
    const fileInput = document.getElementById("profileImageInput");
    const imagePreview = document.querySelector(".image-preview");
    const form = document.getElementById("customProfileForm");

    // Profile selection
    profileBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        this.handleProfileSelection(index, btn);
      });
    });

    // Yes/No buttons
    yesNoLabels.forEach((label, index) => {
      label.addEventListener("click", () => {
        if (index === 0) {
          // Yes - refresh profile view
          this.show(game);
        }
        // No does nothing but close the modal
      });
    });

    // Image preview
    if (fileInput && imagePreview) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            imagePreview.style.backgroundImage = `url('${event.target.result}')`;
            imagePreview.style.backgroundSize = "cover";
            imagePreview.style.backgroundPosition = "center";
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Form submission
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleCustomProfileSubmit(game);
      });
    }

    // Continue button
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        game.sceneManager.switchTo("levelMenu");
      });
    }

    // Add NFT event listeners
    this.addNFTEventListeners();
    this.loadUserNFTs();
  }

  handleProfileSelection(index, btn) {
    // Update all profile selected states
    this.profiles.forEach((p, i) => {
      p.chosen = i === index;
    });

    this.selectedProfileIndex = index;

    // Set the selected profile in game state
    playerProfileInstance.setProfile(this.profiles[index]);

    // Update UI to reflect selection
    document.querySelectorAll(".profile-img").forEach((img) => {
      img.classList.remove("chosen");
    });
    btn.querySelector(".profile-img").classList.add("chosen");

    if (GameState.audio) {
      GameState.audio.play("clickSound");
    }
  }

  async handleCustomProfileSubmit(game) {
    const name = document.getElementById("profileName").value.trim();
    const desc = document.getElementById("profileDesc").value.trim();
    const fileInput = document.getElementById("profileImageInput");
    const file = fileInput?.files?.[0];

    if (!name) {
      alert("Please enter a name for your profile.");
      return;
    }

    this.showMessage("Creating profile...", "Please wait", 0);

    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await this.helpers.uploadToIPFS(file);
      }

      const result = await this.helpers.createLocalProfileFromData(name, desc, imageUrl);

      if (result.success) {
        this.show(game); // Refresh to show new profile
      } else {
        throw new Error("Profile creation failed");
      }
    } catch (error) {
      console.error("Profile creation failed:", error);
      this.showError(
        "Error",
        "Failed to create profile. Please try again."
      );
    } finally {
      this.clearMessage();
    }
  }

  showMessage(title, text, duration = 1500) {
    this.helpers.showMessage(this.root, title, text, duration);
  }

  showError(title, message) {
    this.helpers.showError(this.root, title, message);
  }

  clearMessage() {
    this.helpers.clearMessage();
  }

  hide() {
    this.root.innerHTML = "";
  }
}