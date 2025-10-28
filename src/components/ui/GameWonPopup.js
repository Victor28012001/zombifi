export class GameWonPopup {
  constructor() {
    this.container = null;
    this.titleElement = null;
    this.textElement = null;
    this.timeout = null;
  }

  show() {
    this.clear();

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'game-won-popup';
      this.container.className = 'game-won-popup';
      document.body.appendChild(this.container);

      this.titleElement = document.createElement('h2');
      this.titleElement.className = 'game-won-title';
      this.container.appendChild(this.titleElement);

      this.textElement = document.createElement('p');
      this.textElement.className = 'game-won-text';
      this.container.appendChild(this.textElement);
    }

    this.titleElement.textContent = "Level Complete!";
    this.textElement.textContent = "Loading next level...";
    this.container.style.opacity = "1";

    this.timeout = setTimeout(() => this.clear(), 1500);
  }

  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.container) {
      this.container.style.opacity = "0";
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.remove();
          this.container = null;
          this.titleElement = null;
          this.textElement = null;
        }
      }, 300);
    }
  }
}