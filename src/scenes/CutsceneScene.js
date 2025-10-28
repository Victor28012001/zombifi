import { GameState } from "../core/GameState";
import { DynamicLevelScene } from "./DynamicLevelScene";
const VOICE_SETTINGS = {
  owl: {
    pitch: 0.8, // Lower pitch for electronic sound
    rate: 0.9, // Slightly slower
    volume: 1,
  },
  player: {
    pitch: 1, // Normal pitch
    rate: 1, // Normal speed
    volume: 1,
  },
};
const FACTION_COLORS = {
  Agency: "#3498db",
  Corporation: "#e74c3c",
  Government: "#2ecc71",
};

const FACTION_ICONS = {
  Agency: 1,
  Corporation: 2,
  Government: 3,
};
let selectedFaction = null;

export class CutsceneScene {
  constructor(game, options) {
    this.game = game;
    this.dialogue = options.dialogue || [];
    this.background = options.background || "";
    this.nextScene = options.nextScene;
    this.currentIndex = 0;
    this.typing = false;
    this.voice = null;
    this.music = null;
    this.container = null;
    this.portrait = null;
    this.textBox = null;
    this.tickSound = null;
    this.typingInterval = null;
    this.fullText = "";
    this.currentChar = 0;
  }

  // Method to speak text using Web Speech API
  speakText(text, voiceType = "player") {
    // Check if browser supports SpeechSynthesis
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    const settings = VOICE_SETTINGS[voiceType];

    // Apply voice settings
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;

    // Try to find appropriate voice
    const voices = window.speechSynthesis.getVoices();

    if (voiceType === "owl") {
      // Prefer electronic-sounding voices for Owl
      const electronicVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Daniel")
      );
      if (electronicVoice) utterance.voice = electronicVoice;
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);
  }

  // Helper method to add both touch and click handlers
  addMobileListener(element, handler) {
    if (!element) return;

    // Add both touch and click handlers
    element.addEventListener("click", handler);
    element.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        handler(e);
      },
      { passive: false }
    );
  }

  async enter() {
    // Clear any existing UI first
    this.game.ui.removeAllUI();
    this.game.ui.removeUI("containersss");

    // Create container but don't fade in here - let SceneManager handle it
    this.container = document.createElement("div");
    this.container.id = "cutscene";
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: url('${this.background}') center/cover no-repeat;
      display: flex; 
      align-items: end; 
      justify-content: center;
      color: white; 
      text-shadow: 2px 2px 6px black;
      font-size: 1.4em; 
      opacity: 0;
      transition: opacity 300ms ease-out;
    `;

    // Create faction panel on the left
    this.createFactionPanel();

    // Create container but don't fade in here - let SceneManager handle it
    this.cont = document.createElement("div");
    this.cont.id = "cont";
    this.cont.style.cssText = `
      width: 100%;
      display: flex; 
      align-items: center; 
      justify-content: center;
      text-shadow: 2px 2px 6px black;
      font-size: 1.4em; 
    `;

    // Portrait image
    this.portrait = document.createElement("img");
    this.portrait.id = "cutscene-portrait";
    this.container.appendChild(this.cont);
    this.cont.appendChild(this.portrait);

    // Text box
    this.textBox = document.createElement("div");
    this.textBox.id = "cutscene-text";
    this.cont.appendChild(this.textBox);

    // Skip button
    const skip = document.createElement("button");
    skip.innerText = "Skip";
    skip.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 8px 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      cursor: pointer;
      user-select: none;
    `;
    this.addMobileListener(skip, () => this.finish());
    this.container.appendChild(skip);

    document.getElementById("game-ui").appendChild(this.container);

    // Wait for next frame to ensure DOM is ready
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Fade in cutscene content
    this.container.style.opacity = "1";

    document.addEventListener("keydown", this.skipHandler);
    this.addMobileListener(this.textBox, this.advance);

    this.enableDialogueAdvancement();

    await this.showNextDialogue();
  }

  createFactionPanel() {
    // Create faction panel container
    this.factionPanel = document.createElement("div");
    this.factionPanel.id = "faction-panel";
    this.factionPanel.style.cssText = `
      width: 300px;
      height: 40%;
      overflow-y: auto;
      padding: 15px;
      padding-left: 25px;
      position: absolute;
      left: 0px;
      top: 0px;
      z-index: 50;
      font-size: small;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    // Create task details panel on the right
    this.createTaskDetailsPanel();

    // Add faction sections
    this.createFactionSections();

    this.container.appendChild(this.factionPanel);
  }

  createTaskDetailsPanel() {
    // Create task details panel container
    this.taskDetailsPanel = document.createElement("div");
    this.taskDetailsPanel.id = "task-details-panel";

    // Default content
    this.taskDetailsPanel.innerHTML = `
      <div style="text-align: right; color: #888;">
        <h2>Select a Faction</h2>
        <p style="text-align: right;">Click on a faction in the left panel to view its tasks and objectives</p>
      </div>
    `;

    this.container.appendChild(this.taskDetailsPanel);
  }

  async loadSkullSVG() {
    const response = await fetch("../assets/images/badges/skull.svg");
    const svgText = await response.text();
    return svgText;
  }

  createFactionSections() {
    // Get current level
    const currentLevel = this.game.currentLevel || 1;

    // Fetch task data directly from JSON
    fetch("/Tasks.json")
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((tasksData) => {
        // Find the current level data
        const levelData = tasksData.floors.find(
          (f) => f.floor === currentLevel
        );

        if (!levelData || !levelData.tasks) {
          this.factionPanel.innerHTML += `<p>No tasks available for level ${currentLevel}</p>`;
          return;
        }

        const leftCont = document.createElement("div");

        // Create header
        const header = document.createElement("h2");
        header.classList.add("lop");
        header.textContent = `Level ${currentLevel} - ${levelData.name}`;
        this.factionPanel.appendChild(header);
        this.factionPanel.appendChild(leftCont);

        // Create sections for each faction
        Object.entries(levelData.tasks).forEach(([faction, taskData]) => {
          const factionSection = document.createElement("div");
          factionSection.className = "faction-section";
          factionSection.style.cssText = `
            border-left: 4px solid ${FACTION_COLORS[faction] || "#999"};
          `;

          factionSection.onmouseover = () => {
            if (selectedFaction !== faction) {
              factionSection.style.background = "rgba(255, 255, 255, 0.1)";
              factionSection.style.transform = "translateX(5px)";
            }
          };

          factionSection.onmouseout = () => {
            if (selectedFaction !== faction) {
              factionSection.style.background = "rgba(255, 255, 255, 0.05)";
              factionSection.style.transform = "translateX(0)";
            }
          };

          // Faction header
          const header = document.createElement("div");
          header.style.cssText = `
            display: flex;
            align-items: center;
          `;

          // Skull icons container
          const skullContainer = document.createElement("div");
          skullContainer.style.cssText = `
            display: flex;
            gap: 4px;
            margin-right: 10px;
          `;

          // Get skull count from FACTION_ICONS
          const skullCount = FACTION_ICONS[faction] || 0;

          for (let i = 0; i < 3; i++) {
            const skull = document.createElement("img");
            skull.src = "../assets/images/badges/skull.svg";
            skull.classList.add("skull");
            if (i < skullCount) {
              skull.classList.add("active");
            } else {
              skull.classList.remove("active");
            }
            skullContainer.appendChild(skull);
          }

          // Faction name
          const name = document.createElement("h3");
          name.textContent = faction;
          name.style.margin = "0";
          name.style.color = FACTION_COLORS[faction] || "#fff";
          name.style.fontSize = "1.1em";

          header.appendChild(skullContainer);
          header.appendChild(name);

          factionSection.appendChild(header);

          // Click handler to show task details
          factionSection.addEventListener("click", () => {
            // Remove highlight from previously selected faction
            if (selectedFaction) {
              const previousSections =
                this.factionPanel.querySelectorAll(".faction-section");
              previousSections.forEach((section) => {
                section.style.background = "rgba(255, 255, 255, 0.05)";
                section.style.transform = "scale(1)";
                section.style.boxShadow = "none";
              });
            }

            // Highlight the selected faction
            selectedFaction = faction;
            factionSection.style.background = "rgba(255, 255, 255, 0.15)";
            factionSection.style.transform = "scale(1.05)";
            factionSection.style.boxShadow =
              "0 0 15px rgba(255, 255, 255, 0.2)";

            GameState.faction = faction;
            console.log(`Selected faction: ${faction}`);

            this.showFactionTaskDetails(faction, taskData, currentLevel);

            // Enable dialogue advancement
            this.enableDialogueAdvancement();
          });

          leftCont.appendChild(factionSection);
        });
      })
      .catch((error) => {
        console.error("Failed to load task data:", error);
        this.factionPanel.innerHTML += `<p>Error loading tasks: ${error.message}</p>`;
      });
  }

  // Add this method to enable/disable dialogue advancement
  enableDialogueAdvancement() {
    if (this.cont) {
      // Remove any existing listeners
      this.cont.removeEventListener("click", this.advance);
      this.cont.removeEventListener("touchstart", this.advance);

      // Add new listeners only if a faction is selected
      if (selectedFaction) {
        this.cont.style.cursor = "pointer";
        this.addMobileListener(this.cont, this.advance);
      } else {
        this.cont.style.cursor = "default";
      }
    }
  }

  showFactionTaskDetails(faction, taskData, level) {
    if (!this.taskDetailsPanel) return;

    // Create HTML for task details
    this.taskDetailsPanel.innerHTML = `
      <div style="max-width: 800px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #444; font-size: xx-small;">
          <div id="yout">
            <h1 style="color: ${
              FACTION_COLORS[faction] || "#fff"
            }; margin: 0 0 5px 0;">${faction}</h1>
            <h2 style="color: #f39c12; margin: 0;">Level ${level} Objectives</h2>
          </div>
        </div>

        <div style="background: rgba(0, 0, 0, 0.4); font-size: x-small; margin-bottom: 25px;">
          <h3 style="color: #f39c12; margin-top: 0;">Primary Objective</h3>
          <h4 style="margin: 0 0 10px 0; color: #fff;">${
            taskData.task.name
          }</h4>
          <p style="margin: 0; font-size: x-small; line-height: 1.5;">${
            taskData.task.desc
          }</p>
        </div>

        <div style="font-size: small;">
          <h3 style="color: #f39c12; margin-bottom: 15px;">Subtasks</h3>
          <div style="display: grid; gap: 12px;">
            ${taskData.subtasks
              .map(
                (subtask, index) => `
              <div style="background: rgba(255, 255, 255, 0.08); padding: 5px; border-radius: 6px; border-left: 3px solid ${
                FACTION_COLORS[faction] || "#999"
              };">
                <div style="display: flex; align-items: flex-start;">
                  <div>
                    <h4 style="margin: 0 0 8px 0; color: #fff;">${
                      subtask.name
                    }</h4>
                    <p style="margin: 0; color: #ccc; line-height: 1.4; font-size: x-small;">${
                      subtask.desc
                    }</p>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  skipHandler = (e) => {
    if (e.key === "Escape" && selectedFaction) {
      this.finish();
    } else if (e.key === "Escape") {
      // Show message that faction must be selected first
      this.showSelectionRequiredMessage();
    }
  };

  showSelectionRequiredMessage() {
    const message = document.createElement("div");
    message.textContent = "Please select a faction first";
    message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: #e74c3c;
    padding: 20px;
    border-radius: 8px;
    z-index: 1000;
    font-size: 1.2em;
  `;

    document.body.appendChild(message);

    // Remove message after 2 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 2000);
  }

  // Modify the advance method to check if faction is selected
  advance = () => {
    if (!selectedFaction) {
      this.showSelectionRequiredMessage();
      return;
    }

    if (this.typing) {
      this.finishTyping();
    } else {
      this.showNextDialogue();
    }
  };

  async showNextDialogue() {
    if (this.currentIndex >= this.dialogue.length) {
      await this.finish();
      return;
    }

    const line = this.dialogue[this.currentIndex];
    this.currentIndex++;

    // Update background if provided in line
    if (line.background) {
      this.container.style.background = `url('${line.background}') center/cover no-repeat`;
    }

    // Show portrait if available
    if (line.portrait) {
      try {
        const img =
          line.portrait === "player"
            ? GameState.data.info.pfp
            : "../assets/images/reunion1.png";
        await this.loadImage(img);
        this.portrait.src = img;
        this.portrait.style.display = "block";
      } catch {
        this.portrait.style.display = "none";
      }
    } else {
      this.portrait.style.display = "none";
    }

    // Handle audio - stop any previous speech
    window.speechSynthesis.cancel();

    // Determine voice type based on portrait or text content
    let voiceType = "player";
    if (line.portrait && line.portrait.includes("handler_owl")) {
      voiceType = "owl";
    } else if (line.text.includes("Owl")) {
      voiceType = "owl";
    }

    // Use TTS instead of pre-recorded audio
    this.speakText(line.text, voiceType);

    // Handle music
    if (line.musicCue) {
      if (!this.musicSoundId || this.musicSoundId !== line.musicCue) {
        if (this.musicSoundId) {
          this.game.audio.stopSound(this.musicSoundId);
        }
        try {
          this.musicSoundId = `music_${this.currentIndex}`;
          await this.game.audio.load(this.musicSoundId, line.musicCue);
          this.game.audio.play(this.musicSoundId, 0.5, true);
        } catch (error) {
          console.error("Failed to play music:", error);
          this.musicSoundId = null;
        }
      }
    }

    await this.typeText(line.text);
  }

  async loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Image load failed: ${src}, using fallback`);
        // Create transparent 1x1 pixel fallback
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        resolve(canvas);
      };
      img.src = src;
    });
  }

  async typeText(text) {
    this.textBox.innerHTML = "";
    this.typing = true;

    const playerName = GameState?.data?.info?.name || "Kade";
    this.fullText = text.replace(/Kade/g, playerName);

    this.currentChar = 0;

    const textContainer = document.createElement("span");
    this.textBox.appendChild(textContainer);

    if (!this.tickSound) {
      await this.game.audio.load("tick", "../sounds/flashlight_click.mp3");
    }

    const style = document.createElement("style");
    style.textContent = `
    #cutscene-text {
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.5;
    }
    #cutscene-text span {
      display: inline;
    }
    .player-name {
      color: #9b59b6 !important;
      font-weight: bold !important;
    }
  `;
    document.head.appendChild(style);

    await new Promise((resolve) => {
      this.typingInterval = setInterval(() => {
        if (this.currentChar < this.fullText.length) {
          const char = this.fullText[this.currentChar];

          const remainingText = this.fullText.substring(this.currentChar);

          if (remainingText.startsWith(playerName)) {
            const nameSpan = document.createElement("span");
            nameSpan.className = "player-name";
            nameSpan.textContent = playerName;
            textContainer.appendChild(nameSpan);

            this.currentChar += playerName.length;
          } else {
            const charSpan = document.createElement("span");
            charSpan.textContent = char;
            textContainer.appendChild(charSpan);
            this.currentChar++;
          }

          this.textBox.scrollTop = this.textBox.scrollHeight;

          if (this.currentChar % 2 === 0) {
            this.game.audio.play("tick", 0.4);
          }
        } else {
          clearInterval(this.typingInterval);
          this.typing = false;
          resolve();
        }
      }, 30);
    });
  }

  finishTyping() {
    clearInterval(this.typingInterval);
    this.textBox.innerHTML = this.fullText;
    this.typing = false;
  }

  async finish() {
    if (!selectedFaction) {
      this.showSelectionRequiredMessage();
      return;
    }

    if (this._isExiting) return;
    this._isExiting = true;

    try {
      // Fade out cutscene
      this.container.style.opacity = "0";
      await new Promise((resolve) => {
        this.container.addEventListener("transitionend", resolve, {
          once: true,
        });
      });

      await this.exit();

      // Prepare context for next scene
      const context = {
        musicId: this.musicSoundId,
        levelIndex: this.levelIndex,
      };

      // Ensure controls are properly reset
      // await this.game.controlsSystem.reinitialize(
      //   GameState.renderer.domElement
      // );

      // Reset player state again before loading level
      if (GameState.player) {
        GameState.player.isCompleted = false;
        // await GameState.player.reset();
      }

      // Load next level
      await this.game.sceneManager.switchTo(this.nextScene, context);

      // Only mark cutscene as finished AFTER the new scene is fully initialized
      if (this.game.sceneManager.currentScene instanceof DynamicLevelScene) {
        this.game.cutsceneFinished = true;
      }
    } catch (error) {
      console.error("Cutscene transition failed:", error);
      await this.game.sceneManager.switchTo("mainMenu");
    } finally {
      this._isExiting = false;
    }
  }

  async exit() {
    document.removeEventListener("keydown", this.skipHandler);

    if (this.container) {
      // Remove both event listeners by using the same reference
      this.container.removeEventListener("click", this.advance);
      this.container.removeEventListener("touchstart", this.advance);
    }

    // Stop all audio using GameAudio
    if (this.voiceSoundId) {
      this.game.audio.stopSound(this.voiceSoundId);
    }

    if (this.tickSound) {
      this.game.audio.stopSound("cutscene_tick");
    }

    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    if (this.container && this.container.parentNode) {
      this.container.remove();
    }
  }
}
