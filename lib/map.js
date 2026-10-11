// Карта: массив объектов для Three.js
// Каждый объект: { type, position, size, color }
// type: "ground" | "road" | "building" | "wall" | "dock" | "ramp"

export const MAP = {
  ground: { size: 400, color: 0x3a8c3a },
  water: { size: 500, color: 0x2a6fb5, y: -1 },

  roads: [
    // Главная дорога через карту
    { x: 0, z: 0, w: 200, d: 12, rot: 0 },
    { x: 0, z: 0, w: 200, d: 12, rot: Math.PI / 2 },

    // Кольцо вокруг центра
    { x: -60, z: -60, w: 120, d: 10, rot: 0 },
    { x: -60, z: 60, w: 120, d: 10, rot: 0 },
    { x: -120, z: 0, w: 120, d: 10, rot: Math.PI / 2 },
    { x: 0, z: 0, w: 120, d: 10, rot: Math.PI / 2 },

    // Съезды к аэропорту
    { x: 100, z: -100, w: 150, d: 10, rot: Math.PI / 4 },
    { x: 150, z: -80, w: 100, d: 10, rot: Math.PI / 4 },

    // Дороги к докам
    { x: -140, z: 100, w: 80, d: 10, rot: 0 },
    { x: -100, z: 140, w: 60, d: 10, rot: Math.PI / 2 },
  ],

  // Здания
  buildings: [
    // Офисный центр
    { x: -40, z: -40, w: 20, h: 30, d: 20, color: 0x6b7280 },
    { x: -40, z: -10, w: 20, h: 20, d: 20, color: 0x9ca3af },
    { x: -10, z: -40, w: 20, h: 25, d: 20, color: 0x4b5563 },
    { x: -10, z: -10, w: 20, h: 40, d: 20, color: 0x374151 },

    // Жилые дома
    { x: 40, z: 40, w: 15, h: 12, d: 15, color: 0xd97706 },
    { x: 60, z: 40, w: 15, h: 12, d: 15, color: 0xd97706 },
    { x: 40, z: 60, w: 15, h: 12, d: 15, color: 0xea580c },
    { x: 60, z: 60, w: 15, h: 12, d: 15, color: 0xd97706 },

    // Магазин
    { x: -80, z: 40, w: 30, h: 8, d: 20, color: 0xdc2626 },
    { x: 80, z: -40, w: 25, h: 10, d: 15, color: 0x059669 },

    // Заброшка
    { x: 130, z: 60, w: 20, h: 15, d: 20, color: 0x57534e },
    { x: 150, z: 80, w: 15, h: 10, d: 15, color: 0x44403c },
  ],

  // Аэропорт (справа)
  airport: {
    runway: { x: 140, z: -60, w: 180, d: 12, rot: Math.PI / 4 },
    terminal: { x: 100, z: -30, w: 40, h: 10, d: 30, color: 0x1f2937 },
    tower: { x: 60, z: -100, w: 8, h: 40, d: 8, color: 0xe5e7eb },
    planes: [
      { x: 160, z: -80, rot: Math.PI / 4 },
      { x: 120, z: -30, rot: Math.PI / 4 },
    ]
  },

  // Доки (слева внизу)
  docks: [
    { x: -150, z: 140, w: 60, d: 8, rot: 0, color: 0x78350f },
    { x: -150, z: 160, w: 60, d: 8, rot: 0, color: 0x78350f },
    { x: -180, z: 150, w: 8, d: 40, rot: 0, color: 0x78350f },
    { x: -120, z: 150, w: 8, d: 40, rot: 0, color: 0x78350f },
    // Контейнеры (укрытия)
    { x: -140, z: 120, w: 6, h: 6, d: 6, color: 0xb91c1c },
    { x: -130, z: 120, w: 6, h: 6, d: 6, color: 0x1e40af },
    { x: -120, z: 120, w: 6, h: 6, d: 6, color: 0x15803d },
  ],

  // Эстакада
  ramps: [
    { x: -50, z: 100, w: 20, d: 40, rot: 0, rise: 5 },
    { x: 50, z: -100, w: 20, d: 40, rot: Math.PI, rise: 5 },
  ],

  // Мосты через воду
  bridges: [
    { x: -100, z: 0, w: 60, d: 12, rot: 0 },
    { x: 100, z: 100, w: 60, d: 12, rot: Math.PI / 2 },
  ],

  // Деревья (для атмосферы)
  trees: (() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 150;
      arr.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        scale: 0.8 + Math.random() * 0.7
      });
    }
    return arr;
  })()
};

export const SPAWN_POINTS = [
  { x: -20, z: 20 },
  { x: 20, z: -20 },
  { x: 0, z: 0 },
  { x: -30, z: 30 },
  { x: 30, z: -30 }
];