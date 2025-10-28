import { GameState } from "../../core/GameState.js";
import { client } from "../../utils/honeyCombServices.js";
import { playerProfileInstance } from "../../entities/PlayerProfile.js";
import { createSolanaWalletButton } from "../../utils/walletConnection.js";
import { getUserPublicKey } from "../../utils/walletState.js";
import { ProfileHelpers } from "../helpers/profileHelpers.js";

export class ProfileSelection {
  constructor(root) {
    this.root = root;
    this.profiles = [];
    this.selectedProfileIndex = null;
    this.walletConnected = false;
    this.formSubmitted = false;
    this.messageTimeout = null;
    this.helpers = new ProfileHelpers();
    this.walletChangeHandler = null;
    window.addEventListener("civic-auth-complete", () =>
      this.onCivicAuthComplete()
    );
  }

  async show(game) {
    const publickey = getUserPublicKey();
    const displayKey = this.helpers.formatPublicKey(publickey);
    // console.log("Displaying wallet key:", displayKey);

    // Reset profiles and fetch from chain
    this.profiles = [];
    let hasChainProfiles = false;

    if (publickey) {
      try {
        const chainProfiles = await this.helpers.fetchChainProfiles(publickey);
        if (chainProfiles.length > 0) {
          hasChainProfiles = true;
          this.profiles = chainProfiles;
        }
      } catch (error) {
        console.error("Error fetching chain profiles:", error);
      }
    }

    // If no chain profiles, show default disabled option
    if (!hasChainProfiles) {
      this.profiles = [this.helpers.createDefaultProfile(publickey)];
    }

    // Set the first profile as active in GameState if valid
    if (this.profiles.length > 0 && this.profiles[0].isChainProfile) {
      playerProfileInstance.setProfile(this.profiles[0]);
    }

    // Render UI
    this.root.innerHTML = this.createProfileHTML(displayKey);
    const placeholder = this.root.querySelector(".flex-button-placeholder");

    this.addEventListeners(game);
    createSolanaWalletButton("#connectWalletBtn", () => {
      this.walletConnected = true;
      this.show(game);
    });
    this.setupWalletChangeListener(game);
  }

  async userHasWallet(ctx) {
    return ctx?.solana?.publicKey != null;
  }

  async onCivicAuthComplete(retry = 0) {
    const ctx = window.userContext;
    if (!ctx) {
      if (retry < 5) {
        setTimeout(() => this.onCivicAuthComplete(retry + 1), 200);
        return;
      }
      console.error("Civic user context not found after retries.");
      return;
    }

    if (ctx.user && !(await this.userHasWallet(ctx))) {
      await ctx.createWallet();
    }

    if (await this.userHasWallet(ctx)) {
      const publicKey = ctx.solana?.publicKey;
      if (publicKey) {
        localStorage.setItem("civicWallet", publicKey);
        this.walletConnected = true;
        this.show(GameState.game);
      }
    }
  }

  setupWalletChangeListener(game) {
    // Remove previous listener if exists
    if (this.walletChangeHandler) {
      window.removeEventListener("wallet-changed", this.walletChangeHandler);
    }

    this.walletChangeHandler = async () => {
      await this.refreshProfileView(game);
    };

    window.addEventListener("wallet-changed", this.walletChangeHandler);
  }

  async refreshProfileView(game) {
    const publickey = getUserPublicKey();
    const displayKey = this.helpers.formatPublicKey(publickey);

    // Clear existing profiles
    this.profiles = [];
    let hasChainProfiles = false;

    if (publickey) {
      try {
        const chainProfiles = await this.helpers.fetchChainProfiles(publickey);
        if (chainProfiles.length > 0) {
          hasChainProfiles = true;
          this.profiles = chainProfiles;
        }
      } catch (error) {
        console.error("Error fetching chain profiles:", error);
      }
    }

    // Fallback to default if no profiles found
    if (!hasChainProfiles) {
      this.profiles = [this.helpers.createDefaultProfile(publickey)];
    }

    // Update player profile instance
    if (this.profiles.length > 0) {
      const activeProfile = this.profiles[0];
      playerProfileInstance.setProfile(activeProfile);

      // Update UI immediately
      this.updateProfileUI(displayKey, activeProfile);
    }
  }

  updateProfileUI(displayKey, activeProfile) {
    // Update wallet button display
    const walletBtn = document.getElementById("connectWalletBtn");
    if (walletBtn) {
      walletBtn.textContent = displayKey;
      walletBtn.dataset.connected = activeProfile.isChainProfile
        ? "true"
        : "false";
    }

    // Update profile cards
    const profileCards = document.querySelectorAll(".profile-btn");
    profileCards.forEach((card, index) => {
      const profile = this.profiles[index];
      if (!profile) return;

      // Update image
      const img = card.querySelector(".profile-img");
      if (img) {
        img.src = profile.image || this.helpers.getDefaultAvatar();
        img.classList.toggle("chosen", profile.chosen);
      }

      // Update name
      const nameEl = card.querySelector(".profile-name");
      if (nameEl) nameEl.textContent = profile.name;

      // Update XP/tier indicators
      const tierInfo = this.helpers.getTierDisplayInfo(profile.xp || 0);
      const xpBadge = card.querySelector(".xp-badge");
      if (xpBadge) xpBadge.textContent = `${profile.xp} XP`;

      const tierBadge = card.querySelector(".tier-badge");
      if (tierBadge) {
        tierBadge.className = `tier-badge ${tierInfo.tier.toLowerCase()}`;
        tierBadge.textContent = tierInfo.tier;
      }

      const progressBar = card.querySelector(".progress-bar");
      if (progressBar) progressBar.style.width = `${tierInfo.percent}%`;
    });
  }

  createProfileHTML(displayKey) {
    const createCornerDivs = (baseClass) =>
      Array.from(
        { length: 4 },
        (_, i) => `<div class="${baseClass}${i + 1}"></div>`
      ).join("");

    const DEFAULT_AVATAR = this.helpers.getDefaultAvatar();

    return `
      <div class="main" id="main-profile">
        <div class="mainTitle"><span>Choose Or Create Profile</span></div>
        ${this.createProfileRadios()}
        <div class="menuOpenBtns">
          ${createCornerDivs("corner")}
          <div class="topHeadingDiv">
            <p>Want to own your story?, connect Wallet</p>
            <div class="flex-button-placeholder"></div>
            <div class="flex-button" id="flex-buttons">
              <button id="connectWalletBtn">${displayKey}</button>
            </div>
          </div>
          <div class="selectionBtns">
            ${this.profiles
              .map((profile, i) => this.createProfileButton(profile, i))
              .join("")}
          </div>
        </div>

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
          <button id="bottom-btn">Continue</button>
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
    const disabledClass = profile.disabled ? "disabled" : "";
    const tierInfo = this.helpers.getTierDisplayInfo(profile.xp || 0);

    return `
      <label for="open${index}" class="open profile-btn ${disabledClass}" data-index="${index}" tabindex="0">
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
          <input type="file" accept="image/*" id="profileImageInput" required />
          <div class="image-preview"></div>
        </label>
        <div id="inputs">
          <input type="text" id="profileName" placeholder="Enter name" required />
          <textarea id="profileDesc" placeholder="Enter description" required></textarea>
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
    const openRadios = document.querySelectorAll("input.open");
    const profileBtns = document.querySelectorAll(
      ".profile-btn:not(.disabled)"
    );
    const yesNoLabels = document.querySelectorAll("label.yes, label.no");
    const yesNoRadios = document.querySelectorAll(
      "input.yesCheck, input.noCheck"
    );
    const continueBtn = document.getElementById("bottom-btn");
    const fileInput = document.getElementById("profileImageInput");
    const imagePreview = document.querySelector(".image-preview");
    const form = document.getElementById("customProfileForm");

    let currentIndex = 0;
    let inYesNoSection = false;
    let allowYesNoEnter = false;

    // Profile selection
    profileBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        this.handleProfileSelection(index, btn);

        setTimeout(() => {
          inYesNoSection = true;
          allowYesNoEnter = false;
          currentIndex = 1;
          yesNoLabels[currentIndex].classList.add("focused");
          yesNoLabels[currentIndex].focus();
          setTimeout(() => (allowYesNoEnter = true), 200);
        }, 100);
      });
    });

    // Yes/No buttons
    yesNoLabels.forEach((label, index) => {
      label.addEventListener("click", () => {
        yesNoRadios[index].checked = true;
        GameState.audio.play("yesNoSound");

        if (index === 0) {
          // Yes - refresh profile view
          this.show(game);
        } else {
          // No - return to profile selection
          inYesNoSection = false;
          currentIndex = 0;
          profileBtns[currentIndex].classList.add("focused");
          profileBtns[currentIndex].focus();
        }
      });
    });

    // Image preview
    if (fileInput) {
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
  }

  handleProfileSelection(index, btn) {
    // Update all profile selected states
    this.profiles.forEach((p, i) => {
      p.chosen = i === index;
    });

    this.selectedProfileIndex = index;

    // Set the selected profile in game state
    GameState.playerProfile.setProfile(this.profiles[index]);

    // Update UI to reflect selection
    document.querySelectorAll(".profile-img").forEach((img) => {
      img.classList.remove("chosen");
    });
    btn.querySelector(".profile-img").classList.add("chosen");

    GameState.audio.play("clickSound");
  }

  async handleCustomProfileSubmit(game) {
    const name = document.getElementById("profileName").value.trim();
    const desc = document.getElementById("profileDesc").value.trim();
    const fileInput = document.getElementById("profileImageInput");
    const file = fileInput.files[0];

    if (!file || !name || !desc) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    this.showMessage("Creating profile on blockchain...", "Please wait", 0);

    try {
      const imageUrl = await this.helpers.uploadToIPFS(file);
      const result = await this.helpers.submitProfileToChain(
        name,
        desc,
        imageUrl
      );

      if (result?.status === "Success") {
        this.show(game); // Refresh to show new profile
      } else {
        throw new Error("Chain creation failed");
      }
    } catch (error) {
      console.error("Profile creation failed:", error);
      this.showError(
        "Error",
        "Failed to create profile on blockchain. Please try again."
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
