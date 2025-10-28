export class InitialSplash {
  constructor(root) {
    this.root = root;
  }

  async show() {
    return new Promise((resolve) => {
      // Create splash element with your exact styling
      const splashHTML = `
        <div id="initialSplash" class="initial-splash">
          <img src="/assets/images/Web 1920 – 3.png" alt="Game Logo" class="splash-logo"/>
        </div>
        <style>
          .initial-splash {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            transition: opacity 0.5s ease-out;
          }
          .splash-logo {
            max-width: 100%;
            min-height: 100%;
          }
        </style>
      `;

      this.root.innerHTML += splashHTML;

      // Automatically fade out after 3 seconds
      setTimeout(async () => {
        const splash = document.getElementById("initialSplash");
        if (splash) {
          splash.style.opacity = "0";
          await new Promise((r) => 
            splash.addEventListener("transitionend", r, { once: true })
          );
          this.remove();
        }
        resolve();
      }, 3000);
    });
  }

  remove() {
    const splash = document.getElementById("initialSplash");
    if (splash) splash.remove();
  }
}