export class PopupManager {
  constructor(root, gameState) {
    this.root = root;
    this.gameState = gameState;
    this.currentPopup = null;
  }

  showPopup(html, zIndex = 1000) {
    this.hidePopup();
    this.currentPopup = document.createElement('div');
    this.currentPopup.className = 'game-popup';
    this.currentPopup.style.zIndex = zIndex;
    this.currentPopup.innerHTML = html;
    this.root.appendChild(this.currentPopup);
    return this.currentPopup;
  }

  hidePopup() {
    if (this.currentPopup?.parentNode) {
      this.currentPopup.remove();
    }
    this.currentPopup = null;
  }

  addPopupEventListeners(popup, handlers) {
    Object.entries(handlers).forEach(([selector, handler]) => {
      const element = popup.querySelector(selector);
      if (element) {
        element.addEventListener('click', handler);
        element.addEventListener('touchstart', (e) => {
          e.preventDefault();
          handler(e);
        }, { passive: false });
      }
    });
  }
}