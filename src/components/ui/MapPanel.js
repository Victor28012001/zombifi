export class MapPanel {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "map-panel";
    this.element.classList.add("panell");
    this.element.innerHTML = `
      <h2>Map</h2>
      <p>The in-game map will appear here.</p>
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
