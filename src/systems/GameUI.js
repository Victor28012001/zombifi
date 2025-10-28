import { GameState } from "../core/GameState.js";
// import { runExample } from "../utils/verxioService.js";
import { InventoryUI, ContextMenu } from "../entities/InventoryUI.js";
import { MainMenu } from "../components/ui/MainMenu.js";
import { ProfileSelection } from "../components/ui/ProfileSelection.js";
import { Settings } from "../components/ui/Settings.js";
import { LevelMenu } from "../components/ui/LevelMenu.js";
import { InitialSplash } from "../components/ui/InitialSplash.js";
import { SplashScreen } from "../components/ui/SplashScreen.js";
import { Credits } from "../components/ui/Credits.js";
import { GameHUD } from "../components/ui/GameHUD.js";
import { LoadingScreen } from "../components/ui/LoadingScreen.js";

//popups
import { PauseMenu } from "../components/ui/PauseMenu.js";
import { PopupManager } from "../components/ui/PopupManager.js";
import { GameOverPopup } from "../components/ui/GameOverPopup.js";
import { TimeExpiredPopup } from "../components/ui/TimeExpiredPopup.js";
import { TierNotification } from "../components/ui/TierNotification.js";
import { MessagePopup } from "../components/ui/MessagePopup.js";
import { GameWonPopup } from "../components/ui/GameWonPopup.js";
import { GuidePopup } from "../components/ui/GuidePopup.js";
import { InputManager } from "../components/ui/InputManager.js";
import { NftCard } from "../components/ui/NftCard.js";
import { ImgCarousel } from "../components/ui/ImgCarousel.js";
import { MarketAssets } from "../components/ui/MarketAssets.js";
import { ProfilePopup } from "../components/ui/ProfilePopup.js";
import { EpisodeIntro } from "../components/ui/EpisodeIntro.js";
import { GameTabs } from "../components/ui/GameTabs.js";

export class GameUI {
  constructor() {
    this.root = document.getElementById("game-ui") || this.createRoot();
    this.mainMenu = new MainMenu(this.root);
    this.profileSelection = new ProfileSelection(this.root);
    this.settings = new Settings(this.root);
    this.levelMenu = new LevelMenu(this.root);
    this.initialSplash = new InitialSplash(this.root);
    this.splashScreen = new SplashScreen(this.root);
    this.credits = new Credits(this.root);
    this.gameHUD = new GameHUD(this.root);
    this.loadingScreen = new LoadingScreen();

    //popups
    this.pauseMenu = new PauseMenu(this.root, GameState);
    this.popupManager = new PopupManager(this.root, GameState);
    this.gameOverPopup = new GameOverPopup(this.root, GameState);
    this.timeExpiredPopup = new TimeExpiredPopup(this.root);
    this.tierNotification = new TierNotification(this.root);
    this.messagePopup = new MessagePopup();
    this.gameWonPopup = new GameWonPopup();
    this.guidePopup = new GuidePopup(this.root, GameState);
    this.nftCard = new NftCard();
    this.imgCarousel = new ImgCarousel();
    this.marketAssets = new MarketAssets();
    this.backpack = new ProfilePopup();
    this.episodeIntro = new EpisodeIntro(this.root);
    this.inventoryUI = new InventoryUI();
    GameState.inventary = this.inventoryUI;
    this.inputManager = new InputManager(
      GameState,
      this.root,
      this.inventoryUI,
      this.guidePopup
    );
    this.gameTabs = new GameTabs(this.root, GameState, this.inventoryUI);

    // Enable input handling
    this.inputManager.enable();

    this.domElements = {
      flashlightIndicator: null,
      bloodOverlay: null,
    };
    this.loadingScreenVisible = false;
    this.profiles = [
      {
        name: "Player 1",
        image: "../assets/images/scare.png",
        description: "",
        chosen: false,
        isChainProfile: false,
      },
      {
        name: "Player 2",
        image: "../assets/images/scare.png",
        description: "",
        chosen: false,
        isChainProfile: false,
      },
    ];

    this.selectedProfileIndex = null;
    this.walletConnected = false;
    this.formSubmitted = false;
    this.messageTimeout = null;
    this.contextMenu = new ContextMenu();
    this.showTierProgress = true;

    // Listen to authentication event
    window.addEventListener("civic-auth-complete", () =>
      this.onCivicAuthComplete()
    );
  }

  createRoot() {
    const root = document.createElement("div");
    root.id = "game-ui";
    document.body.appendChild(root);
    return root;
  }

  async showInitialSplash() {
    await this.initialSplash.show();
  }

  async showSplashScreen(onComplete) {
    await this.splashScreen.show(() => {
      this.showMainMenu();
      onComplete?.();
    });
  }

  showCredits(game) {
    this.credits.show(game);
  }

  showMainMenu(game) {
    this.mainMenu.show(game);
  }

  showProfile(game) {
    this.profileSelection.show(game);
  }

  showSettings(game) {
    this.settings.show(game);
  }

  //level Menu
  showLevelMenu(unlockedLevels, loadLevelCallback, resetProgressCallback) {
    this.levelMenu.show(
      unlockedLevels,
      loadLevelCallback,
      resetProgressCallback
    );
  }

  //loading screen
  async showLoadingScreen() {
    await this.loadingScreen.show();
  }

  async hideLoadingScreen() {
    await this.loadingScreen.hide();
  }

  // Game HUD
  showGameHUD(game) {
    this.gameHUD.show(game);
  }

  hidePopup() {
    this.removeUI("game-over-popup");
  }

  // Blocker/instructions screen
  showGuidePopup(onStartGame) {
    this.guidePopup.show(true, onStartGame);
  }

  hudElement = {
    show: (visible, html) => {
      this.removeUI("hud-notification");

      if (visible) {
        const existing = document.getElementById("hud-notification");
        if (existing) existing.remove();

        const div = document.createElement("div");
        div.id = "hud-notification";
        div.style.position = "fixed";
        div.style.bottom = "20%";
        div.style.left = "50%";
        div.style.transform = "translateX(-50%)";
        div.style.background = "rgba(0,0,0,0.7)";
        div.style.color = "white";
        div.style.padding = "10px 20px";
        div.style.borderRadius = "5px";
        div.style.zIndex = "101";
        div.style.textAlign = "center";
        div.innerHTML = html;

        this.root.appendChild(div);
      }
    },
    hide: () => this.removeUI("hud-notification"),
  };

  showGameWonPopup() {
    this.gameWonPopup.show();
  }

  showEpisodeIntro(data) {
    this.episodeIntro.show(this.root, data, () => {
      GameState.game.sceneManager.switchTo("credits");
    });
  }

  showNftCard(data, onClick, overlayContainer = this.root) {
    const card = new NftCard();
    return card.show(overlayContainer, data, onClick);
  }

  showMessage(title, text, duration) {
    this.messagePopup.show(title, text, duration);
  }

  showError(title, message) {
    this.messagePopup.showError(title, message);
  }

  clearMessage() {
    this.messagePopup.clear();
  }

  showPauseMenu() {
    this.pauseMenu.show(this.root.innerHTML);
  }

  hidePauseMenu() {
    this.pauseMenu.hide();
  }

  showContextMenu(index, item, x, y) {
    this.contextMenu.show(index, item, x, y);
  }

  // Effects
  showBloodOverlay() {
    // Remove existing overlay if any
    if (this.domElements.bloodOverlay) {
      this.domElements.bloodOverlay.remove();
    }

    // Create new overlay
    this.domElements.bloodOverlay = document.createElement("div");
    this.domElements.bloodOverlay.id = "blood-overlay";

    this.root.appendChild(this.domElements.bloodOverlay);

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.domElements.bloodOverlay) {
        this.domElements.bloodOverlay.style.opacity = "0.6";
      }

      // Fade out after 1 second
      setTimeout(() => {
        if (this.domElements.bloodOverlay) {
          this.domElements.bloodOverlay.style.opacity = "0";
        }

        // Remove after fade out completes
        setTimeout(() => {
          if (this.domElements.bloodOverlay?.parentNode) {
            this.domElements.bloodOverlay.remove();
            this.domElements.bloodOverlay = null;
          }
        }, 300);
      }, 1000);
    });
  }

  removeUI(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  showGameOverPopup(_renderer, onRestart) {
    this.gameOverPopup.show(onRestart);
  }

  showTimeExpiredMessage(onConfirm) {
    this.removeAllUI();
    this.timeExpiredPopup.show(onConfirm);
  }

  showTierUpgradeNotification(tier) {
    this.tierNotification.show(tier);
  }

  removeAllUI() {
    this.clearMessage();
    this.loadingScreen.remove();
    const ids = [
      "splashScreen",
      "splash",
      "menu",
      "main-menu",
      "blocker-wrapper",
      "ammoHUD",
      "player-hud",
      "blood-overlay",
      "spider-hud",
      "game-over-popup",
      "game-won-popup",
      "flashlight-indicator",
      "canvas-blocker",
      "pauseMenu",
      "main-profile",
    ];
    ids.forEach((id) => this.removeUI(id));
  }

  clear() {
    this.root.innerHTML = "";
  }
}
