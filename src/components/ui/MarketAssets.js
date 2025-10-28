import { GameState } from "../../core/GameState.js";

export class MarketAssets {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.characters = [
      { name: 'Cat', image: 'https://assets.codepen.io/36869/cat-preview.webp', sprite: 'https://assets.codepen.io/36869/cat.webp', frames: 42, width: 2980, height: 5364 },
      { name: 'Spider', image: 'https://assets.codepen.io/36869/spider-preview.webp', sprite: 'https://assets.codepen.io/36869/spider.webp', frames: 28, width: 2980, height: 3576 },
      { name: 'Cow', image: 'https://assets.codepen.io/36869/cow-preview.webp', sprite: 'https://assets.codepen.io/36869/cow.webp', frames: 60, width: 2980, height: 7152 },
      { name: 'Creeper', image: 'https://assets.codepen.io/36869/creeper-preview.webp', sprite: 'https://assets.codepen.io/36869/creeper.webp', frames: 55, width: 2980, height: 6556 },
      { name: 'Enderman', image: 'https://assets.codepen.io/36869/enderman-preview.webp', sprite: 'https://assets.codepen.io/36869/enderman.webp', frames: 55, width: 2980, height: 6556 },
      { name: 'Evoker', image: 'https://assets.codepen.io/36869/evoker-preview.webp', sprite: 'https://assets.codepen.io/36869/evoker.webp', frames: 99, width: 2980, height: 11920 },
      { name: 'Steel Golem', image: 'https://assets.codepen.io/36869/golem-preview.webp', sprite: 'https://assets.codepen.io/36869/golem.webp', frames: 72, width: 2980, height: 8940 },
      { name: 'Skeleton Horse', image: 'https://assets.codepen.io/36869/horse-preview.webp', sprite: 'https://assets.codepen.io/36869/horse.webp', frames: 47, width: 2980, height: 5960 },
      { name: 'Ocelot', image: 'https://assets.codepen.io/36869/ocelot-preview.webp', sprite: 'https://assets.codepen.io/36869/ocelot.webp', frames: 37, width: 2980, height: 4768 },
      { name: 'Panda', image: 'https://assets.codepen.io/36869/panda-preview.webp', sprite: 'https://assets.codepen.io/36869/panda.webp', frames: 88, width: 2980, height: 10728 },
      { name: 'Skeleton', image: 'https://assets.codepen.io/36869/skeleton-preview.webp', sprite: 'https://assets.codepen.io/36869/skeleton.webp', frames: 65, width: 2980, height: 7748 },
      { name: 'Wolf', image: 'https://assets.codepen.io/36869/wolf-preview.webp', sprite: 'https://assets.codepen.io/36869/wolf.webp', frames: 58, width: 2980, height: 7152 },
      { name: 'Squid', image: 'https://assets.codepen.io/36869/squid-preview.png', sprite: 'https://assets.codepen.io/36869/squid.webp', frames: 104, width: 2980, height: 12516 },
      { name: 'Fox', image: 'https://assets.codepen.io/36869/fox-preview.webp', sprite: 'https://assets.codepen.io/36869/fox.webp', frames: 69, width: 2980, height: 8344 },
      { name: 'Villager', image: 'https://assets.codepen.io/36869/villager-preview.webp', sprite: 'https://assets.codepen.io/36869/villager.webp', frames: 37, width: 2980, height: 4768 }
    ];
    this.currentCharacter = null;
    this.animationInterval = null;
  }

  show(container, onPick = () => {}) {
    if (this.isVisible) return;
    this.isVisible = true;

    const wrapper = document.createElement("div");
    wrapper.className = "minecraft-character-picker";

    const title = document.createElement("h1");
    title.textContent = "Black Market";
    wrapper.appendChild(title);

    const columnDiv = document.createElement("div");
    columnDiv.className = "character-column";

    const grid = document.createElement("div");
    grid.className = "character-grid";

    this.characters.forEach((char) => {
      const button = document.createElement("button");
      button.className = "character-button";
      button.title = char.name;

      const img = document.createElement("img");
      img.src = char.image;
      img.alt = char.name;
      button.appendChild(img);

      button.addEventListener("click", () => {
        this.showPreview(char, wrapper);
        onPick(char);
      });

      grid.appendChild(button);
    });

    columnDiv.appendChild(grid);
    wrapper.appendChild(columnDiv);

    const previewContainer = document.createElement("div");
    previewContainer.className = "character-preview";
    columnDiv.appendChild(previewContainer);

    this.element = wrapper;
    container.appendChild(wrapper);
  }

  hide() {
    if (!this.isVisible || !this.element) return;
    this.isVisible = false;
    
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.currentCharacter = null;
  }

  toggle(container, onPick = () => {}) {
    if (this.isVisible) {
      if (GameState.game.controlsSystem) {
        GameState.game.controlsSystem.requestPointerLock();
      }
      this.hide();
    } else {
      if (GameState.game.controlsSystem) {
        document.exitPointerLock();
      }
      this.show(container, onPick);
    }
  }

  showPreview(character, wrapper) {
    const preview = wrapper.querySelector(".character-preview");
    preview.innerHTML = "";

    const name = document.createElement("h2");
    name.textContent = character.name;

    const spriteContainer = document.createElement("div");
    spriteContainer.className = "sprite-container";

    const sprite = document.createElement("div");
    sprite.className = "character-sprite";
    
    
    const columns = 5; 
    const frameWidth = character.width / columns;
    const frameHeight = character.height / Math.ceil(character.frames / columns);
    
    
    const displaySize = 120; 
    const scale = displaySize / frameWidth;
    const scaledHeight = frameHeight * scale;
    
    sprite.style.width = `${displaySize}px`;
    sprite.style.height = `${scaledHeight}px`;
    sprite.style.backgroundImage = `url('${character.sprite}')`;
    sprite.style.backgroundSize = `${character.width * scale}px ${character.height * scale}px`;
    
    spriteContainer.appendChild(sprite);
    
    
    const directionContainer = document.createElement("div");
    directionContainer.className = "sprite-direction";
    
    const leftBtn = document.createElement("button");
    leftBtn.textContent = "◀️";
    leftBtn.addEventListener("click", () => {
      sprite.style.transform = "scaleX(1)";
    });
    
    const rightBtn = document.createElement("button");
    rightBtn.textContent = "▶️";
    rightBtn.addEventListener("click", () => {
      sprite.style.transform = "scaleX(-1)";
    });

    const spriteStats = document.createElement("div");
    spriteStats.className = "sprite-stats";
    spriteStats.innerHTML = `
          <dl>
            <dt>Current frame:</dt>
            <dd class="sprite-tw"></dd>
            <dt>Current col:</dt>
            <dd class="sprite-cc"></dd>
            <dt>Current row:</dt>
            <dd class="sprite-cr"></dd>
            <dt>
              <label for="select-fps">FPS:</label>
            </dt>
            <dd class="sprite-fps">
              <select id="select-fps">
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48" selected>48</option>
                <option value="64">64</option>
                <option value="76">76</option>
                <option value="100">100</option>
              </select>
            </dd>
          </dl>
    `;

    const fpsSelect = spriteStats.querySelector("#select-fps");
    fpsSelect.addEventListener("change", (e) => {
      const newFps = parseInt(e.target.value);
      this.updateSpriteAnimation(sprite, character, newFps);
    });
    spriteContainer.appendChild(spriteStats);
    directionContainer.appendChild(leftBtn);
    directionContainer.appendChild(rightBtn);
    spriteContainer.appendChild(directionContainer);

    preview.appendChild(name);
    preview.appendChild(spriteContainer);
    
    
    this.animateSprite(sprite, character, columns, frameWidth, frameHeight, scale);
  }

  updateSpriteAnimation(sprite, character, fps) {
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    let currentFrame = 0;
    const columns = 5; 
    const totalFrames = character.frames;
    const frameWidth = character.width / columns;
    const frameHeight = character.height / Math.ceil(totalFrames / columns);
    const scale = 120 / frameWidth; 
    const scaledHeight = frameHeight * scale;
    sprite.style.width = `120px`;
    sprite.style.height = `${scaledHeight}px`;
    sprite.style.backgroundSize = `${character.width * scale}px ${character.height * scale}px`;
    const fpsInterval = 1000 / fps; 
    this.animationInterval = setInterval(() => {
      
      const row = Math.floor(currentFrame / columns);
      const col = currentFrame % columns;
      
      
      const xPos = -col * frameWidth * scale;
      const yPos = -row * frameHeight * scale;
      
      sprite.style.backgroundPosition = `${xPos}px ${yPos}px`;
      
      
      currentFrame = (currentFrame + 1) % totalFrames;
    }, fpsInterval);
  }

  animateSprite(sprite, character, columns, frameWidth, frameHeight, scale) {
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    
    let currentFrame = 0;
    const fps = 42; 
    
    this.animationInterval = setInterval(() => {
      
      const row = Math.floor(currentFrame / columns);
      const col = currentFrame % columns;
      
      
      const xPos = -col * frameWidth * scale;
      const yPos = -row * frameHeight * scale;
      
      sprite.style.backgroundPosition = `${xPos}px ${yPos}px`;
      
      
      currentFrame = (currentFrame + 1) % character.frames;
    }, 1000 / fps);
  }
}