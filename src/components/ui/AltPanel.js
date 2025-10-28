// export class AltPanel {
//   constructor() {
//     this.element = document.createElement("div");
//     this.element.className = "alt-panel";

//     this.sidebar = document.createElement("aside");
//     this.sidebar.className = "tutorials-sidebar";

//     this.currentCallback = null;

//     // Tutorial buttons
//     this.tutorials = {
//       map: "Map Tutorial",
//       enemies: "Enemies Tutorial",
//       inventory: "Inventory Tutorial",
//       health: "Health Tutorial",
//       tasks: "Tasks Tutorial",
//       shop: "Shop Tutorial",
//       levels: "Levels Tutorial",
//       upgrades: "Upgrades Tutorial",
//     };

//     this.buildSidebar();
//     this.element.appendChild(this.sidebar);
//   }

//   buildSidebar() {
//     Object.entries(this.tutorials).forEach(([key, label]) => {
//       const btn = document.createElement("button");
//       btn.className = "tutorial-button";
//       btn.textContent = label;
//       btn.addEventListener("click", () => {
//         if (this.currentCallback) {
//           this.currentCallback(key);
//         }
//       });
//       this.sidebar.appendChild(btn);
//     });
//   }

//   setTutorialCallback(cb) {
//     this.currentCallback = cb;
//   }

//   show() {
//     this.element.style.display = "flex";
//   }

//   hide() {
//     this.element.style.display = "none";
//   }
// }
export class AltPanel {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "alt-panel";

    this.sidebar = document.createElement("aside");
    this.sidebar.className = "tutorials-sidebar";

    this.currentCallback = null;
    this.mode = "tutorials";

    this.sidebarData = {
      tutorials: {
        map: "Map Tutorial",
        enemies: "Enemies Tutorial",
        inventory: "Inventory Tutorial",
        health: "Health Tutorial",
        tasks: "Tasks Tutorial",
        shop: "Shop Tutorial",
        levels: "Levels Tutorial",
        upgrades: "Upgrades Tutorial",
      },
      notes: {
        government: "Notes from Government",
        coPlayer: "Notes from Co-player",
        agency: "Notes from Agency",
        corporation: "Notes from Corporation",
        game: "Game Notes",
      }
    };

    this.callbacks = {
      tutorials: null,
      notes: null,
    };

    this.element.appendChild(this.sidebar);
    this.setMode("tutorials"); // default build
  }

  setMode(mode) {
    if (!this.sidebarData[mode]) return;

    this.mode = mode;
    this.currentCallback = this.callbacks[mode];
    this.buildSidebar(this.sidebarData[mode]);
  }

  buildSidebar(data) {
    this.sidebar.innerHTML = ""; // clear existing buttons

    Object.entries(data).forEach(([key, label]) => {
      const btn = document.createElement("button");
      btn.className = "tutorial-button";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (this.currentCallback) {
          this.currentCallback(key);
        }
      });
      this.sidebar.appendChild(btn);
    });
  }

  // Separate callbacks for each mode
  setTutorialCallback(cb) {
    this.callbacks.tutorials = cb;
    if (this.mode === "tutorials") this.currentCallback = cb;
  }

  setNotesCallback(cb) {
    this.callbacks.notes = cb;
    if (this.mode === "notes") this.currentCallback = cb;
  }

  show() {
    this.element.style.display = "flex";
  }

  hide() {
    this.element.style.display = "none";
  }
}
