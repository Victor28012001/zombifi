import { GameState } from "../../core/GameState.js";

export class Settings {
  constructor(root) {
    this.root = root;
    this.settingsElements = {
      musicVolume: null,
      sfxVolume: null,
      muteToggle: null,
      visualQuality: null,
      fullscreenToggle: null,
      languageSelect: null,
      keyboardLayout: null
    };
  }

  show(game) {
    this.root.innerHTML = this.createSettingsHTML();
    this.cacheDOMElements();
    this.loadSettings();
    this.setupEventListeners(game);
  }

  createSettingsHTML() {
    return `
      <div class="settings-scene-container" id="settings-scene">
        <div class="settings-overlay">
          <h1 class="settings-title">Game Settings</h1>

          <div class="setting-group">
            <label for="music-volume">Music Volume</label>
            <input type="range" id="music-volume" min="0" max="1" step="0.01" />
          </div>

          <div class="setting-group">
            <label for="sfx-volume">Sound Effects Volume</label>
            <input type="range" id="sfx-volume" min="0" max="1" step="0.01" />
          </div>

          <div class="setting-group">
            <label for="mute-toggle">Mute All Audio</label>
            <input type="checkbox" id="mute-toggle" />
          </div>

          <div class="setting-group">
            <label for="visual-quality">Visual Quality</label>
            <select id="visual-quality">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="setting-group">
            <label for="fullscreen-toggle">Fullscreen Mode</label>
            <input type="checkbox" id="fullscreen-toggle" />
          </div>

          <div class="setting-group">
            <label for="language-select">Language</label>
            <select id="language-select">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div class="setting-group">
            <label for="keyboard-layout-select">Keyboard Layout</label>
            <select id="keyboard-layout-select">
              <option value="wasd">WASD</option>
              <option value="arrows">Arrow Keys</option>
            </select>
          </div>

          <button id="back-from-settings" class="menu-action-button">
            <span class="button-text">Back to Menu</span>
          </button>
        </div>
      </div>
    `;
  }

  cacheDOMElements() {
    this.settingsElements.musicVolume = document.getElementById("music-volume");
    this.settingsElements.sfxVolume = document.getElementById("sfx-volume");
    this.settingsElements.muteToggle = document.getElementById("mute-toggle");
    this.settingsElements.visualQuality = document.getElementById("visual-quality");
    this.settingsElements.fullscreenToggle = document.getElementById("fullscreen-toggle");
    this.settingsElements.languageSelect = document.getElementById("language-select");
    this.settingsElements.keyboardLayout = document.getElementById("keyboard-layout-select");
  }

  loadSettings() {
    // Audio Settings
    this.settingsElements.musicVolume.value = localStorage.getItem("musicVolume") || 0.5;
    this.settingsElements.sfxVolume.value = localStorage.getItem("sfxVolume") || 1.0;
    this.settingsElements.muteToggle.checked = localStorage.getItem("audioMuted") === "true";

    // Apply audio settings immediately
    GameState.audio.setMusicVolume(parseFloat(this.settingsElements.musicVolume.value));
    GameState.audio.setSfxVolume(parseFloat(this.settingsElements.sfxVolume.value));
    GameState.audio.muteAll(this.settingsElements.muteToggle.checked);

    // Video Settings
    this.settingsElements.visualQuality.value = localStorage.getItem("visualQuality") || "high";
    this.settingsElements.fullscreenToggle.checked = document.fullscreenElement != null;

    // Language Settings
    this.settingsElements.languageSelect.value = localStorage.getItem("language") || "en";

    // Control Settings
    this.settingsElements.keyboardLayout.value = localStorage.getItem("keyboardLayout") || "wasd";
  }

  setupEventListeners(game) {
    // Audio Settings
    this.settingsElements.musicVolume.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value);
      GameState.audio.setMusicVolume(vol);
      localStorage.setItem("musicVolume", vol);
    });

    this.settingsElements.sfxVolume.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value);
      GameState.audio.setSfxVolume(vol);
      localStorage.setItem("sfxVolume", vol);
    });

    this.settingsElements.muteToggle.addEventListener("change", (e) => {
      GameState.audio.muteAll(e.target.checked);
      localStorage.setItem("audioMuted", e.target.checked);
    });

    // Video Settings
    this.settingsElements.visualQuality.addEventListener("change", (e) => {
      localStorage.setItem("visualQuality", e.target.value);
      this.applyVisualQualitySettings(e.target.value);
    });

    this.settingsElements.fullscreenToggle.addEventListener("change", async (e) => {
      if (e.target.checked) {
        await document.documentElement.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    });

    // Language Settings
    this.settingsElements.languageSelect.addEventListener("change", (e) => {
      localStorage.setItem("language", e.target.value);
      // Optionally trigger language change in game
      if (GameState.onLanguageChange) {
        GameState.onLanguageChange(e.target.value);
      }
    });

    // Control Settings
    this.settingsElements.keyboardLayout.addEventListener("change", (e) => {
      localStorage.setItem("keyboardLayout", e.target.value);
      if (GameState.controls) {
        GameState.controls.updateLayout(e.target.value);
      }
    });

    // Back Button
    document.getElementById("back-from-settings").addEventListener("click", () => {
      game.audio.play("clickSound");
      game.sceneManager.switchTo("mainMenu");
    });

    // Fullscreen change sync
    document.addEventListener("fullscreenchange", () => {
      this.settingsElements.fullscreenToggle.checked = document.fullscreenElement != null;
    });
  }

  applyVisualQualitySettings(quality) {
    // Implementation depends on your rendering system
    const renderer = GameState.renderer;
    if (!renderer) return;

    switch (quality) {
      case "low":
        renderer.quality = "low";
        renderer.setPixelRatio(1);
        break;
      case "medium":
        renderer.quality = "medium";
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        break;
      case "high":
        renderer.quality = "high";
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        break;
    }

    if (GameState.onQualityChange) {
      GameState.onQualityChange(quality);
    }
  }

  hide() {
    // Clean up event listeners
    document.removeEventListener("fullscreenchange", this.fullscreenChangeHandler);
    this.root.innerHTML = "";
  }
}