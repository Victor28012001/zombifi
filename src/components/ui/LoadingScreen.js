export class LoadingScreen {
  constructor() {
    this.loadingElement = null;
    this.loadingStyle = null;
    this.visible = false;
  }

  async show() {
    if (this.visible) return;
    this.visible = true;

    // Create loading element
    this.loadingElement = document.createElement("div");
    this.loadingElement.id = "ui-loading-screen";
    this.loadingElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9998;
      color: white;
      font-size: 2em;
      opacity: 0;
      transition: opacity 300ms ease-out;
    `;

    // Create spinner
    const spinner = document.createElement("div");
    spinner.style.cssText = `
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    `;

    // Create text
    const text = document.createElement("div");
    text.textContent = "Loading...";

    // Assemble elements
    this.loadingElement.appendChild(spinner);
    this.loadingElement.appendChild(text);
    document.body.appendChild(this.loadingElement);

    // Add animation style
    this.loadingStyle = document.createElement("style");
    this.loadingStyle.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(this.loadingStyle);

    // Force repaint and fade in
    void this.loadingElement.offsetWidth;
    this.loadingElement.style.opacity = "1";
  }

  async hide() {
    if (!this.visible || !this.loadingElement) return;

    return new Promise((resolve) => {
      this.loadingElement.style.opacity = "0";
      this.loadingElement.addEventListener(
        "transitionend",
        () => {
          this._cleanup();
          this.visible = false;
          resolve();
        },
        { once: true }
      );
    });
  }

  _cleanup() {
    if (this.loadingElement?.parentNode) {
      this.loadingElement.remove();
    }
    if (this.loadingStyle?.parentNode) {
      this.loadingStyle.remove();
    }
    this.loadingElement = null;
    this.loadingStyle = null;
  }

  remove() {
    this._cleanup();
    this.visible = false;
  }
}