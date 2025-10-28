export class GameOverPopup {
  constructor(root, gameState) {
    this.root = root;
    this.gameState = gameState;
  }

  show(onRestart) {
    const popup = document.createElement('div');
    popup.id = 'game-over-popup';
    popup.className = 'game-popup';
    popup.innerHTML = `
      <h2>GAME OVER</h2>
      <p>You didn't survive the night...</p>
      <button id="restart-game" class="popup-button">Restart</button>
    `;

    this.root.appendChild(popup);

    const restartButton = popup.querySelector('#restart-game');
    if (restartButton) {
      const handleRestart = async (e) => {
        e.preventDefault();
        if (this.gameState.controls) this.gameState.controls.unlock();
        if (onRestart) await onRestart();
        popup.remove();
      };

      restartButton.addEventListener('click', handleRestart);
      restartButton.addEventListener('touchstart', handleRestart, { passive: false });
    }

    return popup;
  }
}