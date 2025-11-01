import { preloadCoreAssets, preloadVideoAsset, preloadAllAudio } from "../../utils/Preloader.js";
import { GameState } from "../../core/GameState.js";

export class SplashScreen {
  constructor(root) {
    this.root = root;
    this.loadingScreenVisible = false;
  }

  async show(onComplete) {
    this.loadingScreenVisible = true;
    this.root.innerHTML = this.createSplashHTML();
    
    // Set up loading manager
    GameState.loadingManager.onProgress = (url, loaded, total) => {
      this.updateProgress(loaded, total);
    };

    GameState.loadingManager.onLoad = () => {
      this.showCompletionState();
    };

    try {
      // Start loading assets
      await preloadCoreAssets();
      await preloadAllAudio();
      await preloadVideoAsset("/assets/videos/splash1.mp4");
      
      // Enable start button when everything is loaded
      this.showCompletionState();
    } catch (err) {
      console.error("Error loading assets:", err);
      this.showErrorState();
    }

    this.setupStartButton(onComplete);
  }

  createSplashHTML() {
    return `
      <div id="splashScreen" class="splash-screen">
        <div id="splashContent" class="splash-content">
          <h1>Zombifi</h1>
          <p id="paragraph">Loading assets...</p>
          <div id="loadingBarContainer" class="loading-bar-container">
            <div id="loadingProgress" class="loading-progress"></div>
          </div>
          <button id="loadingButton" class="loading-button" disabled>Start Game</button>
        </div>
      </div>
      <style>
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
        }
        .splash-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(0,0,0,0.7);
          width: 100%;
          height: 100vh;
          justify-content: center;
          color: white;
          padding: 2rem;
        }
        .loading-bar-container {
          width: 300px;
          height: 20px;
          background-color: #333;
          border-radius: 10px;
          margin: 20px 0;
          overflow: hidden;
        }
        .loading-progress {
          height: 100%;
          background-color: #4CAF50;
          width: 0%;
          transition: width 0.3s ease;
        }
        .loading-button {
          margin-top: 2rem;
          padding: 12px 24px;
          background-color: #4a4a8f;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .loading-button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }
        .loading-button:not(:disabled):hover {
          background-color: #6a6aa8;
          transform: translateY(-2px);
        }
      </style>
    `;
  }

  updateProgress(loaded, total) {
    const progress = (loaded / total) * 100;
    const progressEl = document.getElementById("loadingProgress");
    if (progressEl) progressEl.style.width = `${progress}%`;
  }

  showCompletionState() {
    const paragraph = document.getElementById("paragraph");
    const button = document.getElementById("loadingButton");

    if (paragraph) paragraph.textContent = "Assets Loaded!";
    if (button) {
      button.disabled = false;
      button.textContent = "Start Game";
    }
  }

  showErrorState() {
    const paragraph = document.getElementById("paragraph");
    if (paragraph) paragraph.textContent = "Error loading assets!";
  }

  setupStartButton(onComplete) {
    const button = document.getElementById("loadingButton");
    if (button) {
      button.onclick = async () => {
        const screen = document.getElementById("splashScreen");
        if (screen) {
          screen.style.transition = "opacity 0.5s ease";
          screen.style.opacity = "0";
          await new Promise((r) => 
            screen.addEventListener("transitionend", r, { once: true })
          );
          this.remove();
        }
        if (onComplete) onComplete();
      };
    }
  }

  remove() {
    this.loadingScreenVisible = false;
    const splash = document.getElementById("splashScreen");
    if (splash) splash.remove();
  }
}