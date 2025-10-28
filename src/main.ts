// main.js
import "./style.css";
import "./backup.css";
import "./polyfills.js";
import { Game } from "./core/Game.js";
import { SceneTransition } from "./core/SceneTransition.js";
import { GameState } from "./core/GameState.js";
// import { mountCivicAuth } from "./utils/CivicAuthMount.jsx";

const game = new Game();
(GameState as any).game = game;

window.onload = async () => {
  await SceneTransition.fadeOut(500);
  game.init();

  // Lock orientation for mobile
  const _screenOrientation: any = (screen as any).orientation;
  if (_screenOrientation && typeof _screenOrientation.lock === "function") {
    try {
      await _screenOrientation.lock("landscape");
    } catch (err) {
      console.warn("Orientation lock failed:", err);
    }
  }
};

window.onbeforeunload = () => {
  SceneTransition.fadeIn(500);

  // Clean up Three.js resources
  if (GameState.scene) {
    interface Disposable {
      dispose(): void;
    }

    interface ThreeGeometry extends Disposable {}

    interface ThreeMaterial extends Disposable {}

    interface ThreeObject {
      isMesh?: boolean;
      geometry?: ThreeGeometry | null;
      material?: ThreeMaterial | ThreeMaterial[] | null;
      // allow additional props present on three.js objects
      [key: string]: unknown;
    }

    const _scene = GameState.scene as {
      traverse: (cb: (obj: ThreeObject) => void) => void;
    };

    _scene.traverse((obj: ThreeObject) => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });
  }

  if (GameState.renderer) {
    // cast to any because renderer type may be unknown to TypeScript
    (GameState.renderer as any).dispose?.();
  }
};
