import { db } from "../firebase";
import { ref, set, onValue, onDisconnect, serverTimestamp } from "firebase/database";

export class Net {
  constructor(roomId, playerId) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.roomRef = ref(db, `rooms/${roomId}`);
  }

  // Отправляем своё состояние
  sendState(car, role) {
    set(ref(db, `rooms/${this.roomId}/players/${this.playerId}`), {
      x: car.pos.x,
      z: car.pos.z,
      rot: car.rot,
      vx: car.vel.x,
      vz: car.vel.z,
      role,
      updatedAt: Date.now()
    });
  }

  // Слушаем состояние второго игрока
  subscribe(callback) {
    const unsub = onValue(ref(db, `rooms/${this.roomId}/players`), (snap) => {
      const all = snap.val() || {};
      const others = Object.entries(all).filter(([id]) => id !== this.playerId);
      callback(others.map(([id, data]) => ({ id, ...data })));
    });
    return unsub;
  }

  // Роли
  setRoles(roles) {
    set(ref(db, `rooms/${this.roomId}/roles`), roles);
  }

  subscribeRoles(callback) {
    return onValue(ref(db, `rooms/${this.roomId}/roles`), (snap) => {
      callback(snap.val() || {});
    });
  }

  // Отключаемся — удаляем себя
  registerDisconnect() {
    onDisconnect(ref(db, `rooms/${this.roomId}/players/${this.playerId}`)).remove();
  }
}