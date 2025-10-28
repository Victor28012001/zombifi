export class InputManager {
  constructor(gameState, root, inventoryUI, guidePopup) {
    this.gameState = gameState;
    this.root = root;
    this.inventoryUI = inventoryUI;
    this.guidePopup = guidePopup;
    this._boundKeyHandler = this._handleKeyDown.bind(this);
  }

  enable() {
    document.addEventListener("keydown", this._boundKeyHandler);
  }

  disable() {
    document.removeEventListener("keydown", this._boundKeyHandler);
  }

  _handleKeyDown(e) {
    if (!this.gameState.isStarted) return;

    switch (e.key.toLowerCase()) {
      case "i":
        this._toggleInventory();
        break;
      case "g":
        this._toggleGuide();
        break;
      case "h":
        this._toggleHelp();
        break;
    }
  }

  _toggleInventory() {
    if (this.inventoryUI.element.style.display === "block" || this.inventoryUI.element.style.display === "flex") {
      this.inventoryUI.hide();
      this._enableGameControls();
    } else {
      this.inventoryUI.show(true);
      this._disableGameControls();
    }
  }

  _toggleGuide() {
    this.guidePopup.toggle();
  }

  _toggleHelp() {
    this.gameState.game.ui.gameTabs.toggle();
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
