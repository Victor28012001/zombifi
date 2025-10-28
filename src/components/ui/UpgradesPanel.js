export class UpgradesPanel {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "upgrades-panel";
    this.element.classList.add("panell");
    this.element.innerHTML = `
      <h2>Upgrades</h2>
      <p>Manage your upgrades here.</p>
    `;
  }

  show(container) {
    container.appendChild(this.element);
    this.element.style.display = "block";
  }

  hide() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
