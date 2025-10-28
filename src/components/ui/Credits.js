export class Credits {
  constructor(root) {
    this.root = root;
    this.scrollAnimationId = null;
  }

  async show(game) {
    try {
      const credits = await this.loadCredits();
      this.renderCredits(credits);
      this.setupAutoScroll();
      this.setupEventListeners(game);
    } catch (error) {
      console.error("Failed to show credits:", error);
      this.renderErrorState();
    }
  }

  async loadCredits() {
    try {
      const response = await fetch("./Credits.json");
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Failed to load credits:", error);
      return [{ name: "Error loading credits", assetLink: "#" }];
    }
  }

  renderCredits(credits) {
    this.root.innerHTML = `
      <div class="credits-scene-container" id="credits-scene">
        <div class="credits-overlay">
          <h1 class="credits-title">Game Credits</h1>
          <div class="credits-scrollable" id="credits-scroll">
            ${credits.map(entry => `
              <div class="credit-entry">
                <p class="credit-name">${entry.name}</p>
                ${entry.assetLink ? 
                  `<a class="credit-link" href="${entry.assetLink}" target="_blank">${entry.assetLink}</a>` : 
                  ''}
              </div>
            `).join("")}
          </div>
          <div class="back-button-wrapper">
            <button id="back-to-menu" class="menu-action-button">
              <span class="button-text">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderErrorState() {
    this.root.innerHTML = `
      <div class="credits-scene-container" id="credits-scene">
        <div class="credits-overlay">
          <h1 class="credits-title">Game Credits</h1>
          <div class="credits-error">
            <p>Failed to load credits. Please try again later.</p>
          </div>
          <div class="back-button-wrapper">
            <button id="back-to-menu" class="menu-action-button">
              <span class="button-text">Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupAutoScroll() {
    const scrollEl = document.getElementById("credits-scroll");
    if (!scrollEl) return;

    scrollEl.scrollTo({ top: 0 });
    this.stopAutoScroll(); // Clear any existing animation

    const duration = 60000; // 60 seconds
    const startTime = performance.now();
    const startPos = scrollEl.scrollTop;
    const distance = scrollEl.scrollHeight - scrollEl.clientHeight - startPos;

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      scrollEl.scrollTop = startPos + distance * progress;
      
      if (progress < 1) {
        this.scrollAnimationId = requestAnimationFrame(animateScroll);
      }
    };

    this.scrollAnimationId = requestAnimationFrame(animateScroll);
  }

  stopAutoScroll() {
    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId);
      this.scrollAnimationId = null;
    }
  }

  setupEventListeners(game) {
    const backBtn = document.getElementById("back-to-menu");
    if (backBtn) {
      const handleBackClick = () => {
        game.audio.play("clickSound");
        game.audio.stopSound("music");
        this.stopAutoScroll();
        game.sceneManager.switchTo("mainMenu");
      };

      backBtn.addEventListener("click", handleBackClick);
      
      // Cleanup function to remove listener
      this.cleanup = () => {
        backBtn.removeEventListener("click", handleBackClick);
        this.stopAutoScroll();
      };
    }
  }

  hide() {
    if (this.cleanup) this.cleanup();
    this.root.innerHTML = "";
  }
}