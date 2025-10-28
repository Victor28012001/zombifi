export class GuidePopup {
  constructor(root, gameState) {
    this.root = root;
    this.gameState = gameState;
    this.guideElement = null;
    this.isInitial = false;
    this.isVisible = false;
  }

  show(showInitially = false, onStartGame = null) {
    if (this.isVisible || this.guideElement) return;
    this.isVisible = true;
    this.isInitial = showInitially;
    this.startGameCallback = onStartGame;

    this.guideElement = document.createElement("div");
    this.guideElement.id = "guide-popup";
    this.guideElement.className = "guide-popup";

    this.guideElement.innerHTML = `
      <div class="book-cover">
        <div class="book-page left-page">
          <h2 class="book-title">${
            showInitially ? "Adventurer's Guide" : "Game Controls"
          }</h2>
          <div class="book-content">
            <ul class="controls-list">
              <li><span class="key">WASD/Arrows</span> Movement</li>
              <li><span class="key">Mouse</span> Aim</li>
              <li><span class="key">Space</span> Fire Weapon</li>
              <li><span class="key">Space</span> Knife Slash</li>
              <li><span class="key">R</span> Reload Gun</li>
              <li><span class="key">Q</span> Switch Weapon</li>
            </ul>
          </div>
        </div>
        <div class="book-page right-page">
          <div class="book-content">
            <ul class="controls-list">
              <li><span class="key">I</span> Toggle Inventory</li>
              <li><span class="key">G</span> Show This Guide</li>
              <li><span class="key">P</span> Pause Menu</li>
              <li><span class="key">O</span> Open Doors</li>
              <li><span class="key">L</span> Use Flashlight</li>
            </ul>
          </div>
        </div>
        ${
          showInitially
            ? `<button id="start-game-btn" class="book-button">Begin Journey</button>`
            : `<button id="close-guide-btn" class="book-button">Close (G)</button>`
        }
      </div>
    `;

    // Safely append to DOM
    const container = this.root;
    container.appendChild(this.guideElement);

    // Set up event listeners
    if (showInitially) {
      const startBtn = this.guideElement.querySelector("#start-game-btn");
      if (startBtn) {
        startBtn.addEventListener("click", () =>
          this._handleStartGame(onStartGame)
        );
        startBtn.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            this._handleStartGame(onStartGame);
          },
          { passive: false }
        );
      }
    } else {
      const closeBtn = this.guideElement.querySelector("#close-guide-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.hide());
        closeBtn.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            this.hide();
          },
          { passive: false }
        );
      }
    }

    // Disable game controls
    this._disableGameControls();
  }

  _setupEventListeners(showInitially) {
    if (!this.guideElement) return;

    if (showInitially) {
      if (this.gameState.game.controlsSystem) {
        document.exitPointerLock();
      }
      const startBtn = this.guideElement.querySelector("#start-game-btn");
      if (startBtn) {
        startBtn.addEventListener("click", () => this._handleStartGame());
        startBtn.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            this._handleStartGame();
          },
          { passive: false }
        );
      }
    } else {
      const closeBtn = this.guideElement.querySelector("#close-guide-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.hide());
        closeBtn.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            this.hide();
          },
          { passive: false }
        );
      }
    }
  }

  _handleStartGame() {
    this.hide();
    if (this.gameState.controls) {
      this.gameState.controls.lock();
    }
    if (typeof this.startGameCallback === "function") {
      this.startGameCallback();
    }
  }

  hide() {
    if (!this.isVisible || !this.guideElement) return;
    this.isVisible = false;
    this.isInitial = false;

    // Remove from DOM if parent exists
    if (this.guideElement.parentNode) {
      this.guideElement.parentNode.removeChild(this.guideElement);
    }
    this.guideElement = null;
    this.startGameCallback = null;

    // Re-enable game controls
    this._enableGameControls();
  }

  toggle() {
    if (this.isInitial) return;
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
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
