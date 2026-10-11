// Простая аркадная физика. Не реалистичная — быстрая и приятная в управлении.

export class Car {
  constructor(spawn, color = 0xff0000) {
    this.pos = { x: spawn.x, z: spawn.z };
    this.rot = 0;             // угол в радианах
    this.vel = { x: 0, z: 0 }; // скорость
    this.angVel = 0;          // угловая скорость
    this.color = color;

    // Параметры
    this.maxSpeed = 30;       // м/с
    this.accel = 40;          // ускорение
    this.brake = 60;          // торможение
    this.turnSpeed = 3.5;     // рад/с
    this.driftFactor = 0.95;  // при дрифте трение меньше
    this.friction = 0.92;     // обычное трение
  }

  update(keys, dt) {
    // keys: { w, a, s, d, space }
    const forward = keys.w ? 1 : keys.s ? -1 : 0;
    const turn = keys.a ? 1 : keys.d ? -1 : 0;
    const drift = keys.space;

    // Ускорение вперёд
    if (forward !== 0) {
      const dirX = Math.sin(this.rot);
      const dirZ = Math.cos(this.rot);
      const a = forward > 0 ? this.accel : -this.brake;
      this.vel.x += dirX * a * dt;
      this.vel.z += dirZ * a * dt;
    }

    // Ограничение скорости
    const speed = Math.hypot(this.vel.x, this.vel.z);
    if (speed > this.maxSpeed) {
      this.vel.x = (this.vel.x / speed) * this.maxSpeed;
      this.vel.z = (this.vel.z / speed) * this.maxSpeed;
    }

    // Поворот (только если едет)
    if (turn !== 0 && speed > 0.5) {
      const turnRate = this.turnSpeed * (drift ? 1.4 : 1);
      this.angVel = turn * turnRate * Math.min(1, speed / 10);
    } else {
      this.angVel *= 0.9;
    }
    this.rot += this.angVel * dt;

    // Трение
    const fr = drift ? 0.98 : this.friction;
    this.vel.x *= fr;
    this.vel.z *= fr;

    // Движение
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;

    // Границы
    const B = 195;
    if (this.pos.x > B) { this.pos.x = B; this.vel.x = 0; }
    if (this.pos.x < -B) { this.pos.x = -B; this.vel.x = 0; }
    if (this.pos.z > B) { this.pos.z = B; this.vel.z = 0; }
    if (this.pos.z < -B) { this.pos.z = -B; this.vel.z = 0; }
  }

  checkCollision(other) {
    const dx = this.pos.x - other.pos.x;
    const dz = this.pos.z - other.pos.z;
    const dist = Math.hypot(dx, dz);
    return dist < 2.5; // радиус машины * 2
  }
}