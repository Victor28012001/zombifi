import { GameState } from "../core/GameState.js";

export class InventoryUI {
  constructor(maxSize = 16) {
    this.game = GameState.game;
    this.maxSize = maxSize;

    this.element = document.createElement("div");
    this.element.className = "inventory-ui";
    this.element.innerHTML = `
      <div class="inventory-title">INVENTORY</div>
      <div class="inventory-slots"></div>
    `;
    // document.body.appendChild(this.element);

    this.slotsContainer = this.element.querySelector(".inventory-slots");
    this.slots = [];

    // Create all slots once
    for (let i = 0; i < this.maxSize; i++) {
      const slot = document.createElement("div");
      slot.className = "inventory-slot";
      slot.dataset.index = i;

      const slotContent = document.createElement("div");
      slotContent.className = "slot-content";

      const background = document.createElement("div");
      background.className = "slot-background";

      slotContent.appendChild(background);
      slot.appendChild(slotContent);
      this.slotsContainer.appendChild(slot);

      this.slots.push({ slot, background });
    }
  }

  update(items = []) {
    for (let i = 0; i < this.maxSize; i++) {
      const { background } = this.slots[i];
      background.innerHTML = "";

      const entry = items[i];
      if (entry && entry.item && entry.item.name) {
        const itemName = entry.item.name || "Unknown";
        const imgSrc = `../assets/images/badges/${entry.item.icon}.svg`;

        const itemElement = document.createElement("div");
        itemElement.className = "item-icon";
        itemElement.dataset.index = i;

        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = itemName;

        const nameLabel = document.createElement("div");
        nameLabel.className = "item-name";
        nameLabel.textContent = itemName;

        // Add quantity badge if more than 1
        if (entry.quantity > 1) {
          const qty = document.createElement("span");
          qty.classList.add("inventory-quantity");
          qty.innerText = entry.quantity;
          itemElement.appendChild(qty);
        }

        itemElement.appendChild(img);
        itemElement.appendChild(nameLabel);

        itemElement.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = itemElement.getBoundingClientRect();
          if (GameState.game?.ui) {
            GameState.game.ui.showContextMenu(
              i,
              entry.item,
              rect.left,
              rect.top
            );
          }
        });

        background.appendChild(itemElement);
      }
    }
  }

  create(root) {
    root.appendChild(this.element);
  }

  remove() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  show(bool) {
    this.element.style.display = "block";
    if (bool) {
      document.getElementById("game-ui").appendChild(this.element);
      this.element.style.display = "flex";
      this.element.style.position = "absolute";
      this.element.style.bottom = "10px";
      this.element.style.left = "50%";
      this.element.style.transform = "translateX(-50%)";
      this.slotsContainer.style.display = "grid";
      this.slotsContainer.style.gridTemplateColumns = "repeat(8, 1fr)";
      this.slotsContainer.style.gap = "10px";
      this.element.style.height = "max-content";

      // Show only first 8 for hotbar
      for (let i = 0; i < this.slots.length; i++) {
        this.slots[i].slot.style.display = i < 8 ? "block" : "none";
      }
    } else {
      this.element.style.position = "static";
      this.slotsContainer.style.display = "grid";
      this.slotsContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
      this.slotsContainer.style.gap = "5px";
      this.element.style.height = "100%";
      this.element.style.transform = "none";

      // Show all 16 for inventory
      for (let i = 0; i < this.slots.length; i++) {
        this.slots[i].slot.style.display = "block";
      }
    }
  }

  hide() {
    this.element.style.display = "none";
  }
}

export class ContextMenu {
  constructor() {
    this.game = GameState.game;
    this.element = document.createElement("div");
    this.element.className = "context-menu";
    this.element.innerHTML = `
      <div class="context-options">
        <button class="context-use">Use</button>
        <button class="context-drop">Drop</button>
        <button class="context-cancel">Cancel</button>
      </div>
    `;
    document.body.appendChild(this.element);
    this.element.style.display = "none";

    this.currentIndex = -1;

    // Setup event listeners
    this.element.querySelector(".context-use").addEventListener("click", () => {
      this.useItem();
    });

    this.element
      .querySelector(".context-drop")
      .addEventListener("click", () => {
        console.log("drop");
        this.dropItem();
      });

    this.element
      .querySelector(".context-cancel")
      .addEventListener("click", () => {
        console.log("close");
        this.hide();
      });
  }

  show(index, item, x, y) {
    this.currentIndex = index;
    this.element.style.display = "block";
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  hide() {
    this.element.style.display = "none";
    this.currentIndex = -1;
  }

  useItem() {
    if (this.currentIndex >= 0 && GameState.player?.inventar) {
      GameState.player.inventar.useItem(this.currentIndex);
    }
    this.hide();
  }

  dropItem() {
    if (this.currentIndex >= 0 && GameState.player?.inventar) {
      const item = GameState.player.inventar.getItem(this.currentIndex);
      if (item) {
        const player = GameState.controls.getObject();
        const direction = new THREE.Vector3();
        player.getWorldDirection(direction);
        const dropPosition = item.mesh.position
          .copy(player.position)
          .add(direction.multiplyScalar(2));
        item.mesh.position.y = 1;

        // Drop the item
        item.drop(dropPosition);

        // Show drop notification
        GameState.game.ui.hudElement.show(
          true,
          `Dropped <span class='highlight-item'>${item.name}</span>`
        );
      }
    }
    this.hide();
  }
}
