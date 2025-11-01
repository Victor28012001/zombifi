import { GameState } from "../../core/GameState.js";
import { preloadVideoAsset } from "../../utils/Preloader.js";

export class MainMenu {
  constructor(root) {
    this.root = root;
    this.videoElement = null;
  }

  async show(game) {
    this.clear(); // Clear any existing menu

    // Preload video first
    await preloadVideoAsset("/assets/videos/splash1.mp4");

    this.root.innerHTML = this.createMenuHTML();
    this.setupEventListeners(game);
    this.setupVideo();
  }

  createMenuHTML() {
    return `
      <div class="main-menu-container" id="main-menu">
        <video id="menu-bg-video" autoplay muted loop playsinline preload="auto">
          <source src="/assets/videos/splash1.mp4" type="video/mp4" />
        </video>

        <div class="main-menu-overlay">
          <h1 class="game-title">Zombifi</h1>

          <div class="main-buttons">
            <div class="menu-button">
              ${this.monsterHandSVG(true)}
              <button id="play-btn" class="menu-action-button">
                <span class="button-text">Play</span>
              </button>
              ${this.monsterHandSVG(false)}
            </div>

            <div class="menu-button">
              ${this.monsterHandSVG(true)}
              <button id="settings-btn" class="menu-action-button">
                <span class="button-text">Settings</span>
              </button>
              ${this.monsterHandSVG(false)}
            </div>

            <div class="menu-button">
              ${this.monsterHandSVG(true)}
              <button id="credits-btn" class="menu-action-button">
                <span class="button-text">Credits</span>
              </button>
              ${this.monsterHandSVG(false)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners(game) {
    // Play button
    this.addButtonHandler("play-btn", () => {
      this.animateButtonScare("play-btn");
      setTimeout(() => {
        game.sceneManager.switchTo("profile");
      }, 1500);
    });

    // Settings button
    this.addButtonHandler("settings-btn", () => {
      this.animateButtonScare("settings-btn");
      setTimeout(() => {
        game.sceneManager.switchTo("settings");
      }, 1500);
    });

    // Credits button
    this.addButtonHandler("credits-btn", () => {
      this.animateButtonScare("credits-btn");
      setTimeout(() => {
        game.sceneManager.switchTo("credits");
      }, 1500);
    });
  }

  addButtonHandler(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    // Add both click and touch handlers
    button.addEventListener("click", (e) => {
      e.preventDefault();
      handler();
    });

    button.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        handler();
      },
      { passive: false }
    );
  }

  animateButtonScare(btnId) {
    const button = document.getElementById(btnId);
    const span = button.querySelector(".button-text");

    GameState.audio.play("jumpscare");

    // Hide text and expand
    span.classList.add("hidden");
    button.classList.add("expanding");

    // Add scare image if not already there
    let scareImg = button.querySelector(".button-img");
    if (!scareImg) {
      scareImg = document.createElement("img");
      scareImg.src = "/assets/images/scare.png";
      scareImg.className = "button-img";
      button.appendChild(scareImg);
    }

    // Trigger sliding animation
    requestAnimationFrame(() => {
      scareImg.classList.add("show");
    });
  }

  setupVideo() {
    this.videoElement = document.getElementById("menu-bg-video");
    if (!this.videoElement) return;

    const playPromise = this.videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        this.addVideoPlayOverlay();
      });
    }
  }

  addVideoPlayOverlay() {
    if (!this.videoElement) return;

    const playOverlay = document.createElement("div");
    playOverlay.className = "video-play-overlay";
    playOverlay.innerHTML = "▶";
    playOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 5em;
      color: white;
      background: rgba(0,0,0,0.5);
      cursor: pointer;
      z-index: 10;
    `;

    playOverlay.addEventListener("click", () => {
      this.videoElement.play();
      playOverlay.remove();
    });

    this.videoElement.parentNode.appendChild(playOverlay);
  }

  monsterHandSVG(mirror = false) {
    const transformStyle = mirror ? "transform: scaleX(-1);" : "";
    return `
      <div class="hand-container">
        <svg width="60" height="50" viewBox="0 0 90 70"
             xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
             class="hand-svg claw" style="${transformStyle}">
          <g transform="translate(-60, -20) scale(0.545, 0.636) rotate(45, 150, 100)">
            <path d="M150 100 Q145 85 160 70 Q165 65 170 80 Q175 95 170 110 Q165 125 150 100" fill="#e6e6e6"/>
            <path d="M160 70 Q170 50 190 20" stroke="#e6e6e6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M165 75 Q175 55 200 25" stroke="#e6e6e6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M170 80 Q180 60 210 30" stroke="#e6e6e6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M175 90 Q185 70 215 40" stroke="#e6e6e6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M165 105 Q170 95 180 85" stroke="#e6e6e6" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M190 20 L195 10" stroke="#e6e6e6" stroke-width="2"/>
            <path d="M200 25 L207 13" stroke="#e6e6e6" stroke-width="2"/>
            <path d="M210 30 L220 15" stroke="#e6e6e6" stroke-width="2"/>
            <path d="M215 40 L225 25" stroke="#e6e6e6" stroke-width="2"/>
            <path d="M180 85 L188 75" stroke="#e6e6e6" stroke-width="2"/>
          </g>
        </svg>
      </div>`;
  }

  hide() {
    this.clear();
  }

  clear() {
    // Clean up video element
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.removeAttribute("src");
      this.videoElement.load();
      this.videoElement = null;
    }

    // Remove menu container
    const menu = document.getElementById("main-menu");
    if (menu) {
      menu.remove();
    }
  }
}
