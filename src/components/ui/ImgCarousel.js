import { GameState } from "../../core/GameState";

export class ImgCarousel {
  constructor(party = "Agency", floor = 1) {
    this.party = party;
    this.floor = floor;
    this.items = [];
    this.n = 0;
    this.k = 0;
    this.root = null;
    this.catDesc = null;
  }

  async loadTasks() {
    const response = await fetch("/Tasks.json");
    const Tasks = await response.json();

    const floorData = Tasks.floors.find((f) => f.floor === this.floor);
    if (!floorData) throw new Error(`Floor ${this.floor} not found`);

    const partyTask = floorData.tasks[this.party];
    if (!partyTask)
      throw new Error(`${this.party} not found for floor ${this.floor}`);

    this.items = [
      {
        title: partyTask.task.name,
        desc: partyTask.task.desc,
        img: partyTask.task.imageUrl,
      },
      ...partyTask.subtasks.map((st) => ({
        title: st.name,
        desc: st.desc,
        img: st.imageUrl,
      })),
    ];

    this.n = this.items.length;
  }

  rand(max, min) {
    return +(min + (max - min) * Math.random()).toFixed(2);
  }

  create(cont) {
    const outer = document.createElement("div");
    outer.classList.add("carousel-container");
    outer.style.display = "flex";
    outer.style.alignItems = "center";
    outer.style.gap = "2rem";
    outer.style.width = "100%";
    outer.style.position = "relative";
    outer.style.boxSizing = "border-box";

    const wrapper = document.createElement("section");
    wrapper.classList.add("cat-carousel");
    wrapper.style.setProperty("--n", this.n);
    wrapper.style.setProperty("--k", this.k);

    for (let i = 0; i < this.n; i++) {
      const v = this.items[i];
      const article = document.createElement("article");
      article.style.setProperty("--i", i);
      article.style.setProperty("--a", `${this.rand(15, -15)}deg`);

      article.innerHTML =
        i === 0
          ? `<div class="main-task"><h3>${v.title}</h3><p>${v.desc}</p></div><img src="${v.img}" alt="${v.title}" />`
          : `<div class="text-block"><h2>${v.title}</h2><p>${v.desc}</p></div><img src="${v.img}" alt="${v.title}" />`;

      wrapper.appendChild(article);
    }

    // Navigation buttons
    const controls = document.createElement("div");
    controls.innerHTML = `
      <button aria-label="previous" data-inc="-1">&lt;</button>
      <button aria-label="next" data-inc="1">&gt;</button>
    `;
    wrapper.appendChild(controls);

    // Side description
    const catDesc = document.createElement("div");
    catDesc.className = "cat-desc";
    catDesc.innerHTML = `
      <h3>${this.items[this.k].title}</h3>
      <img style="max-width: 80%; height: auto;" src="${
        this.items[this.k].img
      }" alt="${this.items[this.k].title}" />
      <p style="color: #ccc">${this.items[this.k].desc}</p>
    `;
    this.catDesc = catDesc;

    outer.appendChild(wrapper);
    outer.appendChild(catDesc);
    cont.appendChild(outer);

    this.root = outer;
    this.bindEvents(wrapper);
  }

  bindEvents(wrapper) {
    wrapper.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-inc]");
      if (!btn) return;

      const inc = +btn.dataset.inc;
      wrapper.style.setProperty("--p", this.k);
      const next = (this.k + inc + this.n) % this.n;
      wrapper.style.setProperty("--k", next);
      requestAnimationFrame(() => {
        wrapper.style.setProperty("--v", next);
      });
      this.k = next;

      if (this.catDesc) {
        this.catDesc.style.opacity = 0;
        setTimeout(() => {
          this.catDesc.innerHTML = `
            <h3>${this.items[this.k].title}</h3>
            <img style="max-width: 80%; height: auto;" src="${
              this.items[this.k].img
            }" alt="${this.items[this.k].title}" />
            <p style="color: #ccc">${this.items[this.k].desc}</p>
          `;
          this.catDesc.style.opacity = 1;
        }, 200);
      }
    });
  }

  async show(cont) {
    await this.loadTasks(); // load Tasks.json from /public
    this.create(cont);
  }

  async toggle(cont) {
    if (this.root && this.root.parentNode) {
      if (GameState.game.controlsSystem) {
        GameState.game.controlsSystem.requestPointerLock();
      }
      this.remove();
    } else {
      if (GameState.game.controlsSystem) {
        document.exitPointerLock();
      }
      await this.show(cont); // <- pass the container again
    }
  }

  remove() {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
  }
}
