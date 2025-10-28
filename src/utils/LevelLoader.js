import { GameState } from "../core/GameState";

class LevelLoader {
  constructor(scene, gltfLoader, assets) {
    this.scene = scene;
    this.gltfLoader = gltfLoader; // now unused unless fallback needed
    this.assets = assets;
  }

  loadLevel(json) {
    this.loadRooms(json.rooms || []);
    this.loadWalls(json.walls || []);
    this.loadPillars(json.pillars || []);
    // this.loadFloorTiles(json.floorTiles || []);
    // this.loadCeiling(json.floorTiles.grid);
    // this.addCeilingLights(json.floorTiles.grid);
  }

  loadRooms(rooms) {
    rooms.forEach((room) => {
      const modelKey = room.modelKey || room.type;
      const gltf = this.assets[modelKey];
      if (!gltf) {
        console.warn(`Model ${modelKey} not found in preloaded assets`);
        return;
      }

      const model = gltf.scene.clone();

      if (room.grid) {
        const { start, end, spacing } = room.grid;
        for (let x = start[0]; x <= end[0]; x += spacing[0]) {
          for (let z = start[2]; z <= end[2]; z += spacing[1]) {
            const instance = model.clone();
            instance.position.set(x, start[1], z);

            // Apply room-type-specific transforms
            if (room.type === "lounge") {
              instance.scale.set(6, 6, 6);
            } else if (room.type === "couch") {
              instance.scale.set(1.3, 1.3, 1.3);
              // instance.rotation.y = Math.PI / 2;
            } else if (room.type === "benches") {
              instance.scale.set(1.8, 1.8, 1.8);
              instance.rotation.y = Math.PI / 2;
            }

            this.scene.add(instance);
          }
        }
      } else {
        model.position.set(...room.position);

        if (room.type === "reception") {
          model.scale.set(1, 1, 1);
        }

        if (room.type === "toilet") {
          model.scale.set(1.8, 1.8, 1.8);
          // model.rotation.y = Math.PI;
        }

        if (room.type === "elevator") {
          model.scale.set(0.6, 0.7, 0.6);
          model.rotation.y = Math.PI;
        }

        if (room.id === "elevator1") {
          model.scale.set(0.6, 0.7, 0.6);
          model.rotation.y = Math.PI / 2;
        }

        this.scene.add(model);
      }
    });
  }

  loadWalls(walls) {
    walls.forEach((wall) => {
      if (wall.type === "solid") {
        const fullheight = GameState.wallsHeight;
        const topHeight = wall.height;
        let height;
        const thickness = wall.thickness;

        const dx = wall.to[0] - wall.from[0];
        const dz = wall.to[2] - wall.from[2];

        const isHorizontal = Math.abs(dx) > Math.abs(dz);
        const width = isHorizontal ? dx : thickness;
        const depth = isHorizontal ? thickness : dz;

        if (wall.id === "door_top"){
          height = topHeight;
        }else{
          height = fullheight;
        }

        const geometry = new THREE.BoxGeometry(
          Math.abs(width),
          height,
          Math.abs(depth)
        );
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const mesh = new THREE.Mesh(geometry, material);

        const midX = (wall.from[0] + wall.to[0]) / 2;
        const midZ = (wall.from[2] + wall.to[2]) / 2;

        mesh.position.set(midX, height / 2, midZ);
        if (wall.id === "door_top") {
          mesh.position.set(midX, 4.2, midZ);
        }
        this.scene.add(mesh);
      } else if (wall.type === "door") {
        this.createDoor(wall);
      }
    });
  }

  createDoor(wall) {
    const modelKey = wall.modelKey || "door1";
    const gltf = this.assets[modelKey];
    if (!gltf) {
      console.warn(`Door model ${modelKey} not found in preloaded assets`);
      return;
    }

    const model = gltf.scene.clone();
    model.position.set(...wall.position);
    model.name = wall.id;

    if (model.name === "male_door" || model.name === "female_door") {
      model.scale.set(0.78, 0.78, 0.56);
      // model.rotation.y = -Math.PI;
    } else if (model.name === "main_door") {
      model.scale.set(0.01, 0.011, 0.01);
    } else {
      model.scale.set(1, 1, 1);
    }

    if (wall.interactive) {
      model.userData = { interactive: true, opensTo: wall.opensTo };
    }

    this.scene.add(model);
  }

  loadPillars(pillars) {
    if (!pillars.length) return;
    const pillar = pillars[0];
    const { start, end, spacing } = pillar.grid;

    const gltf = this.assets[pillar.modelKey || "pillar"];
    if (!gltf) {
      console.warn("Pillar model not found");
      return;
    }

    for (let x = start[0]; x <= end[0]; x += spacing[0]) {
      for (let z = start[2]; z <= end[2]; z += spacing[1]) {
        const model = gltf.scene.clone();
        model.position.set(x , 0, z );
        model.scale.set(1, 1, 1)
        this.scene.add(model);
      }
    }
  }

  // loadFloorTiles(floorTiles) {
  //   if (!floorTiles.grid) return;

  //   const { start, end, spacing } = floorTiles.grid;

  //   const geometry = new THREE.PlaneGeometry(2, 2);
  //   const material = new THREE.MeshStandardMaterial({
  //     color: 0x999999,
  //     side: THREE.DoubleSide,
  //   });

  //   for (let x = start[0]; x <= end[0]; x += spacing[0]) {
  //     for (let z = start[2]; z <= end[2]; z += spacing[1]) {
  //       const tile = new THREE.Mesh(geometry, material);
  //       tile.rotation.x = -Math.PI / 2;
  //       tile.position.set(x, start[1], z);
  //       this.scene.add(tile);
  //     }
  //   }
  // }

  // loadCeiling(grid) {
  //   const { start, end } = grid;

  //   const width = Math.abs(end[0] - start[0]);
  //   const depth = Math.abs(end[2] - start[2]);

  //   const geometry = new THREE.PlaneGeometry(width, depth);
  //   const material = new THREE.MeshStandardMaterial({
  //     color: 0x222222,
  //     side: THREE.DoubleSide,
  //   });

  //   const ceiling = new THREE.Mesh(geometry, material);
  //   ceiling.rotation.x = Math.PI / 2;
  //   ceiling.position.set(
  //     (start[0] + end[0]) / 2,
  //     3.2,
  //     (start[2] + end[2]) / 2
  //   );

  //   this.scene.add(ceiling);
  // }

  // addCeilingLights(grid, spacing = [6, 6]) {
  //   const { start, end } = grid;
  //   const lightGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.3);
  //   const lightMaterial = new THREE.MeshStandardMaterial({
  //     color: 0xffffff,
  //     emissive: 0xffffff,
  //   });

  //   for (let x = start[0]; x <= end[0]; x += spacing[0]) {
  //     for (let z = start[2]; z <= end[2]; z += spacing[1]) {
  //       const fixture = new THREE.Mesh(lightGeometry, lightMaterial);
  //       fixture.position.set(x, 3.25, z);
  //       fixture.rotation.y = (Math.PI / 2) * (Math.random() > 0.5 ? 1 : 0);
  //       this.scene.add(fixture);

  //       const light = new THREE.PointLight(0xffffff, 1.5, 15);
  //       light.position.set(x, 3.35, z);
  //       fixture.add(light);
  //     }
  //   }
  // }
}

export { LevelLoader };
