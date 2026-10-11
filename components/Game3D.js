import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAP, SPAWN_POINTS } from "../lib/map";
import { Car } from "../lib/physics";

export default function Game3D({ roomId, playerId, nick, onStateUpdate, roleRef, otherCars }) {
  const mountRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ==== Инициализация Three.js ====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 400);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Свет
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -250;
    sun.shadow.camera.right = 250;
    sun.shadow.camera.top = 250;
    sun.shadow.camera.bottom = -250;
    scene.add(sun);

    // ===== Земля =====
    const groundGeo = new THREE.PlaneGeometry(MAP.ground.size, MAP.ground.size);
    const groundMat = new THREE.MeshLambertMaterial({ color: MAP.ground.color });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ===== Вода =====
    const waterGeo = new THREE.PlaneGeometry(MAP.water.size, MAP.water.size);
    const waterMat = new THREE.MeshLambertMaterial({ color: MAP.water.color, transparent: true, opacity: 0.85 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = MAP.water.y;
    scene.add(water);

    // ===== Дороги =====
    MAP.roads.forEach(r => {
      const geo = new THREE.PlaneGeometry(r.w, r.d);
      const mat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = r.rot;
      mesh.position.set(r.x, 0.01, r.z);
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Мосты
    MAP.bridges.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, 0.5, b.d);
      const mat = new THREE.MeshLambertMaterial({ color: 0x555555 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, 0.25, b.z);
      mesh.rotation.y = b.rot;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);
    });

    // ===== Здания =====
    MAP.buildings.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = new THREE.MeshLambertMaterial({ color: b.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // ===== Аэропорт =====
    const ap = MAP.airport;
    // Полоса
    const runwayGeo = new THREE.PlaneGeometry(ap.runway.w, ap.runway.d);
    const runwayMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.rotation.z = ap.runway.rot;
    runway.position.set(ap.runway.x, 0.02, ap.runway.z);
    scene.add(runway);

    // Терминал
    const termGeo = new THREE.BoxGeometry(ap.terminal.w, ap.terminal.h, ap.terminal.d);
    const termMat = new THREE.MeshLambertMaterial({ color: ap.terminal.color });
    const terminal = new THREE.Mesh(termGeo, termMat);
    terminal.position.set(ap.terminal.x, ap.terminal.h / 2, ap.terminal.z);
    terminal.castShadow = true;
    scene.add(terminal);

    // Вышка
    const towerGeo = new THREE.BoxGeometry(ap.tower.w, ap.tower.h, ap.tower.d);
    const towerMat = new THREE.MeshLambertMaterial({ color: ap.tower.color });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(ap.tower.x, ap.tower.h / 2, ap.tower.z);
    tower.castShadow = true;
    scene.add(tower);

    // Самолёты
    ap.planes.forEach(p => {
      const bodyGeo = new THREE.BoxGeometry(20, 3, 3);
      const wingGeo = new THREE.BoxGeometry(3, 0.5, 15);
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const body = new THREE.Mesh(bodyGeo, mat);
      const wing = new THREE.Mesh(wingGeo, mat);
      body.position.set(p.x, 3, p.z);
      body.rotation.y = p.rot;
      wing.position.set(p.x, 3, p.z);
      wing.rotation.y = p.rot;
      body.castShadow = true;
      wing.castShadow = true;
      scene.add(body);
      scene.add(wing);
    });

    // ===== Доки =====
    MAP.docks.forEach(d => {
      const geo = new THREE.BoxGeometry(d.w, d.h || 0.5, d.d);
      const mat = new THREE.MeshLambertMaterial({ color: d.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, (d.h || 0.5) / 2, d.z);
      mesh.rotation.y = d.rot;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // ===== Деревья =====
    MAP.trees.forEach(t => {
      const trunkGeo = new THREE.CylinderGeometry(0.5 * t.scale, 0.7 * t.scale, 4 * t.scale);
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(t.x, 2 * t.scale, t.z);
      trunk.castShadow = true;
      scene.add(trunk);

      const crownGeo = new THREE.SphereGeometry(3 * t.scale, 8, 6);
      const crownMat = new THREE.MeshLambertMaterial({ color: 0x2d8a2d });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(t.x, 6 * t.scale, t.z);
      crown.castShadow = true;
      scene.add(crown);
    });

    // ===== Своя машина =====
    const mySpawn = SPAWN_POINTS[0];
    const myCar = new Car(mySpawn, 0xff2222);

    const carGroup = new THREE.Group();
    // Кузов
    const bodyGeo = new THREE.BoxGeometry(2, 0.6, 4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff2222 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.6;
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);
    // Крыша
    const roofGeo = new THREE.BoxGeometry(1.6, 0.5, 2);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xaa1111 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 1.1;
    roofMesh.position.z = -0.2;
    roofMesh.castShadow = true;
    carGroup.add(roofMesh);
    // Колёса
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    [[-1, -1.2], [1, -1.2], [-1, 1.2], [1, 1.2]].forEach(([x, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x * 0.9, 0.4, z);
      w.castShadow = true;
      carGroup.add(w);
    });
    scene.add(carGroup);

    // ===== Машины других игроков =====
    const otherCarGroups = {};

    // ===== Управление =====
    const keys = { w: false, a: false, s: false, d: false, space: false };
    const onKeyDown = (e) => {
      if (e.code === "KeyW") keys.w = true;
      if (e.code === "KeyA") keys.a = true;
      if (e.code === "KeyS") keys.s = true;
      if (e.code === "KeyD") keys.d = true;
      if (e.code === "Space") { keys.space = true; e.preventDefault(); }
    };
    const onKeyUp = (e) => {
      if (e.code === "KeyW") keys.w = false;
      if (e.code === "KeyA") keys.a = false;
      if (e.code === "KeyS") keys.s = false;
      if (e.code === "KeyD") keys.d = false;
      if (e.code === "Space") keys.space = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ===== Игровой цикл =====
    let lastTime = performance.now();
    let netAccum = 0;

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Обновляем свою машину
      myCar.update(keys, dt);

      // Обновляем меш
      carGroup.position.set(myCar.pos.x, 0, myCar.pos.z);
      carGroup.rotation.y = myCar.rot;

      // Камера сзади
      const camOffset = { x: -Math.sin(myCar.rot) * 10, z: -Math.cos(myCar.rot) * 10 };
      camera.position.x = myCar.pos.x + camOffset.x;
      camera.position.z = myCar.pos.z + camOffset.z;
      camera.position.y = 6;
      camera.lookAt(myCar.pos.x, 1, myCar.pos.z);

      // Отправка состояния в сеть (20 раз в секунду)
      netAccum += dt;
      if (netAccum > 0.05) {
        netAccum = 0;
        if (onStateUpdate) onStateUpdate(myCar, roleRef.current);
      }

      // Обновление других машин
      if (otherCars.current) {
        otherCars.current.forEach(o => {
          if (!otherCarGroups[o.id]) {
            const g = new THREE.Group();
            const bGeo = new THREE.BoxGeometry(2, 0.6, 4);
            const bMat = new THREE.MeshLambertMaterial({ color: o.role === "seeker" ? 0xff2222 : 0x2288ff });
            const b = new THREE.Mesh(bGeo, bMat);
            b.position.y = 0.6;
            b.castShadow = true;
            g.add(b);
            const rGeo = new THREE.BoxGeometry(1.6, 0.5, 2);
            const rMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
            const r = new THREE.Mesh(rGeo, rMat);
            r.position.y = 1.1;
            g.add(r);
            scene.add(g);
            otherCarGroups[o.id] = g;
          }
          const g = otherCarGroups[o.id];
          g.position.set(o.x, 0, o.z);
          g.rotation.y = o.rot;
        });
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Ресайз
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    gameRef.current = { myCar, camera, scene, renderer };

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={mountRef} style={{ position: "fixed", inset: 0 }} />;
}