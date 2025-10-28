export class CreditsScene {
  constructor(game) {
    this.game = game;
  }

  async enter() {
    if (this.game.renderer?.domElement) {
      this.game.renderer.domElement.remove();
      this.game.renderer = null;
    }
    this.game.ui.showCredits(this.game);
  }

  async exit() {
    // Ensure UI is cleared before transition completes
    this.game.ui.removeAllUI();
    // this.game.ui.removeUI("main-menu");
  }
}
