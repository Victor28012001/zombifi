import { GameState } from "../../core/GameState";
import PlayerHud from "./PlayerHud";

export class GameHUD {
  constructor(root) {
    this.root = root;
  }

  show() {
    // Always reassign in case this.root got replaced
    this.root = document.getElementById("hud-container") || this.root;
    if (!this.root) {
      console.warn("GameHUD root is undefined.");
      return;
    }
    const hud = new PlayerHud();
    const svgMarkup = hud.getPlayerHUDSVG();

    // Clear and render HUD
    this.root.innerHTML = `
      <div id="ammoHUD">
        <p><img src="./assets/images/bullet.png" alt="" />Bullets:
          <span id="currentBullets">30</span> /
          <span id="totalBullets">${GameState.totalBullets}</span>
        </p>
        <span id="weapon-hud" class="hud-weapon">MP5</span>
        <p id="reloadMessage" style="display: none; color: red">Press R to Reload</p>
      </div>
      <div id="player-hud">
      ${svgMarkup}
      </div>
      <div id="timer-hud">
        <span id="game-timer">05:00</span>
      </div>
      <div id="spider-hud">
        <p><img src="./assets/images/spider.png" alt="" width="24" />Spiders: <span id="total-spiders">0</span></p>
        <p><img src="./assets/images/skull.png" alt="" width="16" />Kills: <span id="spiders-killed">0</span></p>
      </div>
    `;

    this.createFlashlightIndicator();

    if (this.isMobileDevice() && GameState.game.controlsSystem) {
      GameState.game.controlsSystem.setControlsEnabled(true);

      if (GameState.game.controlsSystem.isMobile) {
        this.createMobileControls();
        GameState.game.controlsSystem.setupMobileControls();
      }
    }
  }

  createFlashlightIndicator() {
    const batteryContainer = document.getElementById("battery-container");
    if (!batteryContainer) return;

    const indicator = document.createElement("div");
    indicator.id = "flashlight-indicator";
    indicator.style.cssText = `
      position: absolute;
      top: -5px;
      left: -4px;
      background-image: url(./assets/images/flashlight_on.png);
      background-size: cover;
      transition: opacity 0.2s;
      pointer-events: none;
      border: 1px #8282a9 solid;
      border-radius: 50%;
      background-color: white;
    `;
    batteryContainer.appendChild(indicator);
  }

  isMobileDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }

  createMobileControls() {
    this.removeMobileControls();

    if (!this.root) {
      console.warn("createMobileControls failed: root is undefined");
      return;
    }

    const moveJoystick = this.createJoystick("move");
    this.root.appendChild(moveJoystick);

    const aimJoystick = this.createJoystick("aim");
    this.root.appendChild(aimJoystick);

    const actionButtons = this.createActionButtons();
    this.root.appendChild(actionButtons);
  }

  createJoystick(type) {
    const joystick = document.createElement("div");
    joystick.id = `joystick-${type}`;
    joystick.className = "joystick";
    joystick.style.cssText = `
      position: fixed;
      ${type === "move" ? "left: 30px;" : "right: 30px;"} bottom: 30px;
      width: 150px;
      height: 150px;
      touch-action: none;
      z-index: 1000;
    `;

    const base = document.createElement("div");
    base.id = `joystick-${type}-base`;
    base.className = "joystick-base";
    base.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
    `;

    const knob = document.createElement("div");
    knob.id = `joystick-${type}-knob`;
    knob.className = "joystick-knob";
    knob.style.cssText = `
      position: absolute;
      width: 50%;
      height: 50%;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      top: 25%;
      left: 25%;
      transition: transform 0.1s;
    `;

    base.appendChild(knob);
    joystick.appendChild(base);

    return joystick;
  }

  createActionButtons() {
    const container = document.createElement("div");
    container.id = "mobile-action-buttons";

    const shootBtn = this.createActionButton("shoot", "F");
    shootBtn.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    container.appendChild(shootBtn);

    const reloadBtn = this.createActionButton("reload", "R");
    reloadBtn.style.backgroundColor = "rgba(255, 165, 0, 0.5)";
    container.appendChild(reloadBtn);

    const flashlightBtn = this.createActionButton("flashlight", "L");
    flashlightBtn.style.backgroundColor = "rgba(255, 255, 0, 0.5)";
    container.appendChild(flashlightBtn);

    return container;
  }

  createActionButton(id, text) {
    const button = document.createElement("div");
    button.id = `mobile-${id}-btn`;
    button.className = "mobile-action-btn";
    button.textContent = text;
    return button;
  }

  removeMobileControls() {
    const ids = [
      "joystick-move",
      "joystick-aim",
      "mobile-action-buttons",
      "mobile-reload-btn",
      "mobile-flashlight-btn",
    ];

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  }

  refreshMobileControls() {
    this.root = document.getElementById("hud-container") || this.root;
    if (!this.root) {
      console.warn("Cannot refresh mobile controls: root is undefined");
      return;
    }

    this.removeMobileControls();
    this.createMobileControls();

    setTimeout(() => {
      if (GameState.game.controlsSystem) {
        GameState.game.controlsSystem.setupMobileControls();
      }
    }, 50);
  }

  remove() {
    this.removeMobileControls();
    this.root.innerHTML = "";
  }
}
