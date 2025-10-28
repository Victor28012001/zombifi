export class PauseMenu {
  constructor(root, gameState) {
    this.root = root;
    this.gameState = gameState;
    this.pauseElement = null;
    this.canvasBlocker = null;
    this.currentHUD = null;
  }

  show(currentHUD) {
    this.currentHUD = currentHUD;
    this._createPauseMenu();
    this._setupEventListeners();

    // Disable controls when pausing
    if (this.gameState.game.controlsSystem) {
      this.gameState.game.controlsSystem.setControlsEnabled(false);
    }

    this._createCanvasBlocker();
  }

  hide() {
    this._removePauseMenu();
    this._removeCanvasBlocker();

    // Re-enable controls
    if (this.gameState.game.controlsSystem) {
      this.gameState.game.controlsSystem.setControlsEnabled(true);
    }
  }

  _createPauseMenu() {
    this.pauseElement = document.createElement("div");
    this.pauseElement.id = "pauseMenu";
    this.pauseElement.className = "pauseMenu";
    this.pauseElement.innerHTML = `
      <div class="pause-menu">
        <div class="pause-menu-header">
          <h2>GAME PAUSED</h2>
          <div id="pause-timer">${this._formatTime(
            this.gameState.timer.remaining
          )}</div>
          <button id="settings-gear" class="gear-button">⚙️ SETTINGS</button>
        </div>
        <button id="resume-button" class="pause-menu-btn">RESUME</button>
        <button id="restart-button" class="pause-menu-btn">RESTART LEVEL</button>
        <button id="main-menu-button" class="pause-menu-btn">MAIN MENU</button>
      </div>
    `;

    this.root.appendChild(this.pauseElement);
  }

  _createCanvasBlocker() {
    this.canvasBlocker = document.createElement("div");
    this.canvasBlocker.id = "canvas-blocker";
    this.canvasBlocker.className = "canvas-blocker";
    document.body.appendChild(this.canvasBlocker);
  }

  _removePauseMenu() {
    if (this.pauseElement?.parentNode) {
      this.pauseElement.remove();
    }
    this.pauseElement = null;
  }

  _removeCanvasBlocker() {
    if (this.canvasBlocker?.parentNode) {
      this.canvasBlocker.remove();
    }
    this.canvasBlocker = null;
  }

  _setupEventListeners() {
    this._addMobileListener("resume-button", this._handleResume.bind(this));
    this._addMobileListener("restart-button", this._handleRestart.bind(this));
    this._addMobileListener(
      "main-menu-button",
      this._handleMainMenu.bind(this)
    );
    this._addMobileListener("settings-gear", this._handleSettings.bind(this));
  }

  _addMobileListener(elementId, handler) {
    const element = document.getElementById(elementId);
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

  _handleResume(e) {
    e.preventDefault();
    this.hide();

    if (!this.gameState.controls) {
      this.gameState.game.controlsSystem.reinitialize(
        this.gameState.renderer.domElement
      );
    }

    this.gameState.game.togglePause();

    if (!this.gameState.game.controlsSystem.isMobile) {
      setTimeout(() => {
        try {
          this.gameState.controlsSystem.ensurePointerLock();
          this.gameState.renderer.domElement.focus();
        } catch (err) {
          console.warn("Pointer lock error:", err);
        }
      }, 50);
    }
  }

  _handleRestart() {
    this.gameState.game.controlsSystem.reinitialize(
      this.gameState.renderer.domElement
    );
    if (this.gameState.controls) {
      this.gameState.controls.unlock();
    }

    if (!this.gameState.controls) {
      this.gameState.game.controlsSystem.reinitialize(
        this.gameState.renderer.domElement
      );
    }
    this.gameState.game.resetCurrentLevel();
    this.hide();
  }

  async _handleMainMenu() {
    // Pause the game first
    this.gameState.game.stopGameLoop();
    this.gameState.game.togglePause();

    // Clean up controls first
    if (this.gameState.controlsSystem) {
      this.gameState.controlsSystem.cleanup();
    }

    const currentScene = this.gameState.game.sceneManager.currentScene;
    if (currentScene?.cleanup) {
      currentScene.cleanup();
    }

    this.gameState.audio.stopAllSounds();
    this.gameState.game.resetLevelState();
    this.hide();
    this.gameState.game.ui.removeAllUI();

    this.gameState.game.cleanupEverything();

    await this.gameState.game.sceneManager.switchTo("mainMenu");
  }

  _handleSettings(e) {
    e.stopPropagation();
    this._showSettingsPopup();
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  _showSettingsPopup() {
    // Remove existing popup if any
    const existingPopup = document.getElementById("settings-popup");
    if (existingPopup) existingPopup.remove();

    // Create popup container
    const popup = document.createElement("div");
    popup.id = "settings-popup";
    popup.className = "settings-popup";

    // Create header with close button
    const header = document.createElement("div");
    header.className = "settings-popup-header";

    const title = document.createElement("h3");
    title.className = "settings-popup-title";
    title.textContent = "Settings";

    const closeBtn = document.createElement("button");
    closeBtn.className = "settings-popup-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => this._removeSettingsPopup());
    closeBtn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        this._removeSettingsPopup();
      },
      { passive: false }
    );

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create settings content
    const settingsContent = document.createElement("div");
    settingsContent.className = "settings-popup-content";

    // Add volume controls and mute button
    settingsContent.appendChild(this._createVolumeControl("music"));
    settingsContent.appendChild(this._createVolumeControl("sfx"));
    settingsContent.appendChild(this._createMuteButton());

    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(settingsContent);
    document.body.appendChild(popup);

    // Handle outside clicks
    this._setupPopupEventListeners(popup);
  }

  _createVolumeControl(type) {
    const control = document.createElement("div");
    control.className = `settings-popup-control settings-${type}-control`;

    const label = document.createElement("label");
    label.className = "settings-popup-label";
    label.textContent = `${type === "music" ? "Music" : "SFX"} Volume`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = `${type}Volume`;
    slider.className = "settings-popup-slider";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = this.gameState.audio[`${type}Volume`];
    slider.addEventListener("input", (e) => {
      this.gameState.audio[`set${type === "music" ? "Music" : "Sfx"}Volume`](
        parseFloat(e.target.value)
      );
    });

    control.appendChild(label);
    control.appendChild(slider);
    return control;
  }

  _createMuteButton() {
    const muteBtn = document.createElement("button");
    muteBtn.className = "settings-popup-mute-btn";
    muteBtn.textContent = this.gameState.audio.isMuted
      ? "Unmute Audio"
      : "Mute Audio";
    muteBtn.addEventListener("click", () => this._toggleMute());
    muteBtn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        this._toggleMute();
      },
      { passive: false }
    );
    return muteBtn;
  }

  _toggleMute() {
    this.gameState.audio.muteAll(!this.gameState.audio.isMuted);
    const muteBtn = document.querySelector(".settings-popup-mute-btn");
    if (muteBtn) {
      muteBtn.textContent = this.gameState.audio.isMuted
        ? "Unmute Audio"
        : "Mute Audio";
    }
  }

  _setupPopupEventListeners(popup) {
    const handleOutsideClick = (e) => {
      if (popup && !popup.contains(e.target)) {
        this._removeSettingsPopup();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });

    // Prevent canvas from blocking touches
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.style.pointerEvents = "none";

      // Cleanup when popup is removed
      popup._cleanup = () => {
        canvas.style.pointerEvents = "auto";
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
      };
    }
  }

  _removeSettingsPopup() {
    const popup = document.getElementById("settings-popup");
    if (popup) {
      if (popup._cleanup) popup._cleanup();
      popup.remove();
    }
  }
}
