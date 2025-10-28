export class TimeExpiredPopup {
  constructor(root) {
    this.root = root;
  }

  show(onConfirm) {
    const popup = document.createElement('div');
    popup.id = 'time-expired-popup';
    popup.className = 'game-popup';
    popup.innerHTML = `
      <div class="time-expired-content">
        <h2>TIME'S UP!</h2>
        <p>You didn't complete the level in time</p>
        <button id="retry-button" class="popup-button">Retry Level</button>
      </div>
    `;

    this.root.appendChild(popup);

    const retryButton = popup.querySelector('#retry-button');
    if (retryButton) {
      const handleRetry = async (e) => {
        e.preventDefault();
        if (typeof onConfirm === 'function') await onConfirm();
        popup.remove();
      };

      retryButton.addEventListener('click', handleRetry);
      retryButton.addEventListener('touchstart', handleRetry, { passive: false });
    }

    return popup;
  }
}