// export class TutorialsPanel {
//   constructor() {
//     this.element = document.createElement("div");
//     this.element.className = "tutorials-panel";

//     this.sidebar = document.createElement("aside");
//     this.sidebar.className = "tutorials-sidebar";

//     this.content = document.createElement("div");
//     this.content.className = "tutorials-content";

//     this.tutorials = {
//       map: {
//         title: "Map Tutorial",
//         content: `
//           Aurora Blacksite is sprawling and multi-leveled. 
//           Your map updates in real-time as you explore — but only in areas where power nodes are restored.
//           Hidden tunnels, sealed labs, and sector lockdowns will obscure full visibility.
//           Factions may share map data if you aid them — but beware of sabotage or false leads.
//         `,
//       },
//       enemies: {
//         title: "Enemies Tutorial",
//         content: `
//           Biotech mutations roam freely. Expect erratic behavior, sudden aggression, and immunity to basic tactics.
//           Use cover, silence, and motion detectors to avoid fights you can't win. 
//           Some factions may tag enemies or give you creature research — others want you to kill on sight.
//           Know your enemy — or die learning.
//         `,
//       },
//       inventory: {
//         title: "Inventory Tutorial",
//         content: `
//           Inventory is grid-based with weight and size limits. 
//           Weapons, tools, samples, and encrypted drives take up space. Prioritize what you carry.
//           Crafting benches and faction storage units can help manage overflow.
//           Smuggling corporate data? Keep it hidden from agency scans.
//         `,
//       },
//       health: {
//         title: "Health Tutorial",
//         content: `
//           You don’t regenerate health automatically. 
//           Use bio-gels, trauma kits, or field nanite dispensers.
//           Certain experimental serums grant temporary buffs — or permanent mutations.
//           Health status affects movement, aim stability, and vision. Stay patched up.
//         `,
//       },
//       tasks: {
//         title: "Tasks Tutorial",
//         content: `
//           Tasks come from all three factions — often conflicting.
//           Choose wisely. Completing one may lock out others.
//           Optional tasks — like finding survivors or decrypting logs — offer XP and rare gear.
//           Some tasks are time-sensitive. Delaying may cost you people… or truth.
//         `,
//       },
//       shop: {
//         title: "Shop Tutorial",
//         content: `
//           "Shops" are black-market terminals or faction-specific vendors.
//           Government favors stability gear. Corporation offers bleeding-edge tech. 
//           The Agency deals in intel, silencers, and stealth tools.
//           Your choices — and reputation — affect pricing and availability.
//         `,
//       },
//       levels: {
//         title: "Levels Tutorial",
//         content: `
//           Leveling up unlocks skills in Recon, Tech, and Survival trees.
//           XP comes from combat, exploration, and moral choices.
//           Some skills unlock exclusive dialogue or new routes.
//           Want to ghost through or go guns-blazing? Your path, your build.
//         `,
//       },
//       upgrades: {
//         title: "Upgrades Tutorial",
//         content: `
//           Upgrade weapons at benches using scavenged materials or faction tech.
//           Mods include silencers, plasma converters, auto-injectors, and adaptive grips.
//           Armor upgrades affect speed, vision, and threat detection.
//           Some upgrades are permanent and can't be undone. Choose what kind of survivor you’ll be.
//         `,
//       },
//     };

//     this.renderSidebar();
//     this.setTutorial("map"); // default

//     this.element.appendChild(this.sidebar);
//     this.element.appendChild(this.content);
//   }

//   renderSidebar() {
//     Object.entries(this.tutorials).forEach(([key, data]) => {
//       const btn = document.createElement("button");
//       btn.textContent = data.title;
//       btn.className = "tutorial-button";
//       btn.addEventListener("click", () => this.setTutorial(key));
//       this.sidebar.appendChild(btn);
//     });
//   }

//   setTutorial(key) {
//     const t = this.tutorials[key];
//     this.content.innerHTML = `
//       <h2>${t.title}</h2>
//       <p>${t.content}</p>
//     `;
//   }

//   show(container) {
//     container.appendChild(this.element);
//     this.element.style.display = "flex";
//   }

//   hide() {
//     if (this.element.parentNode) {
//       this.element.parentNode.removeChild(this.element);
//     }
//   }
// }

export class TutorialsPanel {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "tutorials-content";

    this.tutorials = {
      map: {
        title: "Map Tutorial",
        content: `
          Aurora Blacksite is sprawling and multi-leveled. 
          Your map updates in real-time as you explore — but only in areas where power nodes are restored.
          Hidden tunnels, sealed labs, and sector lockdowns will obscure full visibility.
          Factions may share map data if you aid them — but beware of sabotage or false leads.
        `,
      },
      enemies: {
        title: "Enemies Tutorial",
        content: `
          Biotech mutations roam freely. Expect erratic behavior, sudden aggression, and immunity to basic tactics.
          Use cover, silence, and motion detectors to avoid fights you can't win. 
          Some factions may tag enemies or give you creature research — others want you to kill on sight.
          Know your enemy — or die learning.
        `,
      },
      inventory: {
        title: "Inventory Tutorial",
        content: `
          Inventory is grid-based with weight and size limits. 
          Weapons, tools, samples, and encrypted drives take up space. Prioritize what you carry.
          Crafting benches and faction storage units can help manage overflow.
          Smuggling corporate data? Keep it hidden from agency scans.
        `,
      },
      health: {
        title: "Health Tutorial",
        content: `
          You don’t regenerate health automatically. 
          Use bio-gels, trauma kits, or field nanite dispensers.
          Certain experimental serums grant temporary buffs — or permanent mutations.
          Health status affects movement, aim stability, and vision. Stay patched up.
        `,
      },
      tasks: {
        title: "Tasks Tutorial",
        content: `
          Tasks come from all three factions — often conflicting.
          Choose wisely. Completing one may lock out others.
          Optional tasks — like finding survivors or decrypting logs — offer XP and rare gear.
          Some tasks are time-sensitive. Delaying may cost you people… or truth.
        `,
      },
      shop: {
        title: "Shop Tutorial",
        content: `
          "Shops" are black-market terminals or faction-specific vendors.
          Government favors stability gear. Corporation offers bleeding-edge tech. 
          The Agency deals in intel, silencers, and stealth tools.
          Your choices — and reputation — affect pricing and availability.
        `,
      },
      levels: {
        title: "Levels Tutorial",
        content: `
          Leveling up unlocks skills in Recon, Tech, and Survival trees.
          XP comes from combat, exploration, and moral choices.
          Some skills unlock exclusive dialogue or new routes.
          Want to ghost through or go guns-blazing? Your path, your build.
        `,
      },
      upgrades: {
        title: "Upgrades Tutorial",
        content: `
          Upgrade weapons at benches using scavenged materials or faction tech.
          Mods include silencers, plasma converters, auto-injectors, and adaptive grips.
          Armor upgrades affect speed, vision, and threat detection.
          Some upgrades are permanent and can't be undone. Choose what kind of survivor you’ll be.
        `,
      },
    };

    // Start with default
    this.setTutorial("map");
  }

  setTutorial(key) {
    const t = this.tutorials[key];
    this.element.innerHTML = `
      <h2 style="color: red">${t.title}</h2>
      <p style="color: #fff; text-align: left;">${t.content}</p>
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
