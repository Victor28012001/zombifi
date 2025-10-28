export class EpisodeIntro {
  constructor() {
    this.element = null;
  }

  show(container, data, onComplete) {
    // Remove existing element
    if (this.element) {
      this.element.remove();
    }

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "cutscene-intro";
    wrapper.innerHTML = `
      <div class="bg-image" style="background-image: url('${data.background}')"></div>
      <div class="ink-overlay"></div>
      <div class="title-container">
        <h1 class="episode-title">${data.title}</h1>
      </div>
      <audio id="slash-sfx" src="${data.audio}" preload="auto"></audio>
    `;

    container.appendChild(wrapper);
    this.element = wrapper;

    this.animate(wrapper, onComplete);
  }

  animate(wrapper, onComplete) {
    const titleEl = wrapper.querySelector(".episode-title");
    const overlay = wrapper.querySelector(".ink-overlay");
    const sfx = wrapper.querySelector("#slash-sfx");

    // Split text manually into spans
    const chars = titleEl.textContent.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      return span;
    });

    titleEl.textContent = "";
    chars.forEach((span) => titleEl.appendChild(span));

    // GSAP Timeline animation
    const tl = gsap.timeline({
      onComplete: () => onComplete?.(),
    });

    tl.to(overlay, { opacity: 0.8, duration: 0.3 });
    tl.add(() => sfx.play(), "<");

    tl.from(chars, {
      opacity: 0,
      scale: 3,
      duration: 0.7,
      ease: "back.out(1.7)",
      stagger: 0.05,
    }, "<0.1");

    tl.to(".title-container", {
      duration: 0.3,
      x: "+=10",
      repeat: 5,
      yoyo: true,
      ease: "rough({ strength: 2, points: 10, template: linear, randomize: true })",
    }, "+=0.2");

    tl.to(wrapper, { opacity: 0, duration: 1, delay: 1 });
  }
}
