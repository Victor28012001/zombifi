import { MarketAssets } from "./MarketAssets.js";
import { ImgCarousel } from "./ImgCarousel.js";
import { ProfilePopup } from "./ProfilePopup.js";
import { AltPanel } from "./AltPanel.js";
import { NotesPanel } from "./NotesPanel.js";
import { MapPanel } from "./MapPanel.js";
import { UpgradesPanel } from "./UpgradesPanel.js";
import { TutorialsPanel } from "./TutorialsPanel.js";

export class GameTabs {
  constructor(container, gameState, inventoryUI) {
    this.container = container;
    this.cont = null;
    this.gameState = gameState;
    this.inventoryUI = inventoryUI;

    // Instances of sub-components
    this.marketAssets = new MarketAssets();
    this.altPanel = new AltPanel();
    this.profilePopup = new ProfilePopup();
    this.notesPanel = new NotesPanel();
    this.mapPanel = new MapPanel();
    this.upgradesPanel = new UpgradesPanel();
    this.tutorialsPanel = new TutorialsPanel();

    this.currentTab = null;
    this.tabButtons = {};
  }

  init() {
    this.imgCarousel = new ImgCarousel(this.gameState.faction, this.gameState.currentLevel + 1);
    const contain = document.createElement("div");
    contain.className = "container";
    this.container.appendChild(contain);
    this.cont = contain;
    const lowerContain = document.createElement("div");
    lowerContain.className = "lower-container";

    // Create tab bar
    const tabBar = document.createElement("div");
    tabBar.className = "game-tabs";

    const tabs = [
      { name: "Profile", key: "profile" },
      { name: "Tasks", key: "carousel" },
      { name: "Shop", key: "market" },
      { name: "Notes", key: "notes" },
      { name: "Map", key: "map" },
      { name: "Upgrades", key: "upgrades" },
      { name: "Tutorials", key: "tutorials" },
    ];

    tabs.forEach(({ name, key }) => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.className = "tab-button";
      btn.dataset.key = key;
      this.tabButtons[key] = btn;

      btn.addEventListener("click", () => this.selectTab(key));
      tabBar.appendChild(btn);
    });

    contain.appendChild(tabBar);
    contain.appendChild(lowerContain);

    // Create content area
    this.contentArea = document.createElement("div");
    this.contentArea.className = "game-tab-content";
    this.lowerContain = lowerContain;
    lowerContain.appendChild(this.inventoryUI.element);
    lowerContain.appendChild(this.contentArea);

    this.inventoryUI.show(false);

    // Show first tab by default
    this.selectTab("profile");
    if (this.gameState.game.controlsSystem) {
      this.gameState.game.controlsSystem.requestPointerLock();
    }
  }

  selectTab(key) {
    if (this.currentTab === key) return;

    // Clean up previous content
    this.hideAll();

    // Highlight selected tab
    Object.entries(this.tabButtons).forEach(([tabKey, btn]) => {
      btn.classList.toggle("active", tabKey === key);
    });

    const showAltPanel = key === "notes" || key === "tutorials";

    this.inventoryUI.element.remove();
    this.altPanel.element.remove();

    // Add the correct one
    if (showAltPanel) {
      this.lowerContain.prepend(this.altPanel.element);
      this.altPanel.show();
    } else {
      this.lowerContain.prepend(this.inventoryUI.element);
      this.inventoryUI.show();
    }

    // Render new content
    switch (key) {
      case "profile":
        this.profilePopup.show(this.contentArea);
        break;
      case "carousel":
        this.imgCarousel.show(this.contentArea);
        break;
      case "market":
        this.marketAssets.show(this.contentArea);
        break;
      case "notes":
        this.altPanel.setMode("notes");
        this.altPanel.setNotesCallback((category) => {
          this.notesPanel.setCategory(category);
        });
        this.notesPanel.show(this.contentArea);
        break;
      case "map":
        this.mapPanel.show(this.contentArea);
        break;
      case "upgrades":
        this.upgradesPanel.show(this.contentArea);
        break;
      case "tutorials":
        this.altPanel.setMode("tutorials");
        this.altPanel.setTutorialCallback((key) => {
          this.tutorialsPanel.setTutorial(key);
        });
        this.tutorialsPanel.show(this.contentArea);
        break;
    }

    this.currentTab = key;
  }

  hideAll() {
    this.profilePopup.hide();
    this.imgCarousel.remove();
    this.marketAssets.hide();
    this.notesPanel.hide();
    this.mapPanel.hide();
    this.upgradesPanel.hide();
    this.tutorialsPanel.hide();
    this.inventoryUI.hide();
    this.altPanel.hide();
    if (this.gameState.game.controlsSystem) {
      document.exitPointerLock();
    }
  }

  toggle() {
    const crosshair = document.getElementById("crosshair");
    if (this.cont && this.cont.parentNode) {
      this.remove();
      this._enableGameControls();
      if (crosshair) crosshair.style.display = "block";
    } else {
      this.init();
      this._disableGameControls();
      if (crosshair) crosshair.style.display = "none";
    }
  }

  remove() {
    if (this.cont && this.cont.parentNode) {
      this.cont.parentNode.removeChild(this.cont);
    }
    this.cont = null;
    this.contentArea = null;
    this.currentTab = null;

    // Clean up both panels
    this.inventoryUI.hide();
    this.altPanel.hide();
  }

  _enableGameControls() {
    if (this.gameState.game.controlsSystem) {
      this.gameState.game.controlsSystem.requestPointerLock();
    }
  }

  _disableGameControls() {
    if (this.gameState.game.controlsSystem) {
      document.exitPointerLock();
    }
  }
}
