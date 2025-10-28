import { GameState } from "../../core/GameState.js";
import "./levelMenu.css";

export class LevelMenu {
  constructor(root) {
    this.root = root;
    this.levelButtonsContainer = null;
    this.resetButton = null;
    this.backButton = null;
    this.levelDetailsContainer = null;
    this.currentSelectHandler = null;
  }

  show(unlockedLevels, loadLevelCallback, resetProgressCallback) {
    if (!document.getElementById("containersss")) {
      this.root.insertAdjacentHTML("beforeend", this.createLevelMenuHTML());
    }

    this.cacheDOMElements();
    this.populateLevelButtons(unlockedLevels, loadLevelCallback);
    this.setupEventListeners(resetProgressCallback);

    document.getElementById("containersss")?.classList.remove("hidden");
  }

  createLevelMenuHTML() {
    return `
      <div class="containersss" id="containersss">
        <header>
          <h1>LEVELS</h1>
        </header>
        <div class="main-content">
          <div class="episode-list">
            <h2 class="section-title">SELECT LEVEL</h2>
            <ul class="episode-items"></ul>
          </div>
          <div class="episode-details" id="levelDetails">
            <!-- Level details will be shown here -->
          </div>
        </div>
        <div class="action-buttons">
          <button class="back-button">
            BACK
          </button>
          <button class="select-button" disabled>SELECT LEVEL</button>
        </div>
      </div>
    `;
  }

  cacheDOMElements() {
    this.levelButtonsContainer = document.querySelector(".episode-items");
    this.levelDetailsContainer = document.getElementById("levelDetails");
    this.resetButton = document.querySelector("#resetProgress");
    this.backButton = document.querySelector("#backToMenu");
    this.selectButton = document.querySelector(".select-button");
  }

  populateLevelButtons(unlockedLevels, loadLevelCallback) {
    const container = this.levelButtonsContainer;

    if (!container) {
      setTimeout(
        () => this.populateLevelButtons(unlockedLevels, loadLevelCallback),
        100
      );
      return;
    }

    container.innerHTML = "";

    GameState.levelData.forEach((level, i) => {
      const fullName = level.name;
      const shortName = fullName.split(" - ")[0].trim();

      const listItem = document.createElement("li");
      listItem.className = "episode-item";
      listItem.innerHTML = `<span class="episode-text">LEVEL ${
        i + 1
      }: ${shortName}</span>`;

      // Add the "active" class to the first item (index 0) by default
      if (i === 0) {
        listItem.classList.add("active");
        this.updateLevelDetails(level, loadLevelCallback, i, unlockedLevels); // Show details for the first level
      }

      listItem.addEventListener("click", () => {
        // Remove active class from the previous selected item
        const previouslySelected = container.querySelector(".active");
        if (previouslySelected) {
          previouslySelected.classList.remove("active");
        }

        // Add the active class to the clicked level
        listItem.classList.add("active");

        // Update level details
        this.updateLevelDetails(level, loadLevelCallback, i, unlockedLevels);
      });

      container.appendChild(listItem);
    });
  }

  updateLevelDetails(level, loadLevelCallback, levelIndex, unlockedLevels) {
    const fullName = level.name;
    const shortName = fullName.split(" - ")[0].trim();
    const shortLoc = fullName.split(" - ")[1].trim();
    const title = document.createElement("h2");
    title.classList.add("episode-title");
    const subtitle = document.createElement("h3");
    subtitle.classList.add("episode-subtitle");
    const description = document.createElement("p");
    description.classList.add("episode-description");
    const gallery = document.createElement("div");
    gallery.classList.add("episode-stats");

    // Populate the level's information
    title.textContent = shortName;
    subtitle.textContent = `LEVEL ${levelIndex + 1}: ${shortLoc}`;
    description.textContent = level.description;
    gallery.innerHTML = `
      <div class="stat stat-large">
        <div class="stat-label">DIFFICULTY</div>
        <div class="stat-values">MODERATE</div>
      </div>
      <div class="stat">
        <div class="stat-label">ESTIMATED TIME</div>
        <div class="stat-values">45-60 MIN</div>
      </div>
      <div class="stat">
        <div class="stat-label">ENEMY TYPES</div>
        <div class="stat-values">8</div>
      </div>
      <div class="stat">
        <div class="stat-label">ACHIEVEMENTS</div>
        <div class="stat-values">12</div>
      </div>
    `;

    const isLocked = levelIndex >= unlockedLevels;
    console.log("isLocked", isLocked);
    console.log(levelIndex, unlockedLevels);

    // Update button visual state
    this.selectButton.disabled = isLocked;
    this.selectButton.style.opacity = isLocked ? 0.5 : 1;
    this.selectButton.style.cursor = isLocked ? "not-allowed" : "pointer";

    // Remove old listener if any
    if (this.currentSelectHandler) {
      this.selectButton.removeEventListener("click", this.currentSelectHandler);
      this.currentSelectHandler = null;
    }

    // Add new listener if unlocked
    if (!isLocked) {
      this.currentSelectHandler = () => {
        console.log("clicked");
        loadLevelCallback(levelIndex);
      };
      this.selectButton.addEventListener("click", this.currentSelectHandler);
    }

    const container = this.levelDetailsContainer;
    container.innerHTML = ""; // Clear any previous details
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(description);
    container.appendChild(gallery);
  }

  setupEventListeners(resetProgressCallback) {
    if (this.resetButton) {
      this.addMobileListener(this.resetButton, resetProgressCallback);
    }

    if (this.backButton) {
      this.addMobileListener(this.backButton, () => {
        GameState.audio.play("clickSound");
        GameState.game.sceneManager.switchTo("mainMenu");
      });
    }
  }

  addMobileListener(element, handler) {
    if (!element) return;
    element.addEventListener("click", handler);
    element.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        handler(e);
      },
      { passive: false }
    );
  }

  hide() {
    this.root.innerHTML = "";
  }
}
