export class NotesPanel {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "notes-panel";

    this.header = document.createElement("h2");
    this.header.style.color = "red";
    this.body = document.createElement("div");

    this.element.appendChild(this.header);
    this.element.appendChild(this.body);

    this.notesContent = {
      government: {
        title: "From the Government",
        content: `Your survival is of national interest. Comply with disposal protocol. All logs must be destroyed.`,
      },
      coPlayer: {
        title: "From Elira (Co-Player)",
        content: `I found something. Not just test logs — there's something alive in the lower lab. I can't leave yet.`,
      },
      agency: {
        title: "From the Agency",
        content: `Data transmission initialized. Hold position. We'll extract you both once the uplink completes.`,
      },
      corporation: {
        title: "From the Corporation",
        content: `Time-sensitive intel: Specimen X-09 is the primary asset. Bring the samples — your payout doubles.`,
      },
      game: {
        title: "System Message",
        content: `Auto-save complete. New objective: Reach Cryo Lab Delta.`,
      },
    };

    // default content
    this.setCategory("coPlayer");
  }

  setCategory(category) {
    const note = this.notesContent[category];
    this.header.textContent = note.title;
    this.body.innerHTML = `<p style="color: #fff; text-align: left;">${note.content}</p>`;
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
