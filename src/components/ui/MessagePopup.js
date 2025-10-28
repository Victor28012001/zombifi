export class MessagePopup {
  constructor() {
    this.container = null;
    this.titleElement = null;
    this.textElement = null;
    this.timeout = null;
  }

  show(title, text, duration = 1500) {
    this.clear();

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'game-message-container';
      this.container.className = 'game-message-popup';
      document.body.appendChild(this.container);
    }

    this.container.innerHTML = `
      <h2 class="message-title">${title}</h2>
      <p class="message-text">${text}</p>
    `;

    this.container.style.opacity = '1';

    this.timeout = setTimeout(() => this.clear(), duration);
  }

  showError(title, message) {
    this.show(title, message, 3000);
    const titleElement = this.container?.querySelector('.message-title');
    if (titleElement) {
      titleElement.style.color = '#f44336';
    }
  }

  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.container) {
      this.container.style.opacity = '0';
      setTimeout(() => {
        if (this.container?.parentNode) {
          this.container.remove();
          this.container = null;
        }
      }, 300);
    }
  }
}