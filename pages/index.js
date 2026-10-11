import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { ref, set, onValue, remove, onDisconnect, push } from "firebase/database";

export default function Lobby() {
  const [nick, setNick] = useState("");
  const [players, setPlayers] = useState({});
  const [challenges, setChallenges] = useState({});
  const [myId, setMyId] = useState(null);
  const [inLobby, setInLobby] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("playerId") || Math.random().toString(36).slice(2, 10);
    localStorage.setItem("playerId", id);
    setMyId(id);
    const savedNick = localStorage.getItem("nick") || "";
    setNick(savedNick);
  }, []);

  useEffect(() => {
    if (!inLobby || !myId) return;

    // Слушаем список игроков
    const unsubP = onValue(ref(db, "lobby/players"), (snap) => {
      setPlayers(snap.val() || {});
    });

    // Слушаем вызовы, адресованные мне
    const unsubC = onValue(ref(db, "lobby/challenges"), (snap) => {
      const all = snap.val() || {};
      const mine = {};
      Object.entries(all).forEach(([id, ch]) => {
        if (ch.to === myId) mine[id] = ch;
      });
      setChallenges(mine);
    });

    return () => { unsubP(); unsubC(); };
  }, [inLobby, myId]);

  const enterLobby = () => {
    if (!nick.trim() || !myId) return;
    localStorage.setItem("nick", nick);
    set(ref(db, `lobby/players/${myId}`), {
      nick,
      joinedAt: Date.now()
    });
    // Удалить из лобби при закрытии
    onDisconnect(ref(db, `lobby/players/${myId}`)).remove();
    setInLobby(true);
  };

  const challenge = async (targetId) => {
    const chId = push(ref(db, "lobby/challenges")).key;
    await set(ref(db, `lobby/challenges/${chId}`), {
      from: myId,
      fromNick: nick,
      to: targetId,
      createdAt: Date.now(),
      roomId: "room_" + chId
    });
    // Ждём ответа
    const unsub = onValue(ref(db, `lobby/challenges/${chId}/status`), (snap) => {
      const st = snap.val();
      if (st === "accepted") {
        unsub();
        router.push(`/game?room=${chId}&role=host&nick=${encodeURIComponent(nick)}`);
      } else if (st === "declined") {
        unsub();
        alert("Вызов отклонён");
        remove(ref(db, `lobby/challenges/${chId}`));
      }
    });
  };

  const acceptChallenge = (chId) => {
    set(ref(db, `lobby/challenges/${chId}/status`), "accepted");
    router.push(`/game?room=${chId}&role=guest&nick=${encodeURIComponent(nick)}`);
  };

  const declineChallenge = (chId) => {
    set(ref(db, `lobby/challenges/${chId}/status`), "declined");
    setTimeout(() => remove(ref(db, `lobby/challenges/${chId}`)), 3000);
  };

  const leaveLobby = () => {
    remove(ref(db, `lobby/players/${myId}`));
    setInLobby(false);
  };

  if (!inLobby) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(circle at 20% 20%, #1a1f2e, #0a0d12)"
      }}>
        <div style={{ maxWidth: 420, padding: 40, background: "#12161f", borderRadius: 20, border: "1px solid #232a3a" }}>
          <h1 style={{ marginBottom: 8, color: "#ff7a18" }}>🏎 Гонки онлайн</h1>
          <p style={{ color: "#8a95a8", marginBottom: 24, fontSize: 14 }}>Введи ник, чтобы играть с другом</p>
          <input
            value={nick}
            onChange={e => setNick(e.target.value)}
            placeholder="Твой ник"
            style={{
              width: "100%", padding: 12, background: "#1a1f2e", border: "1px solid #232a3a",
              borderRadius: 8, color: "#fff", fontSize: 15, marginBottom: 16, fontFamily: "inherit"
            }}
          />
          <button onClick={enterLobby} style={{ width: "100%" }}>Войти в лобби</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 20%, #1a1f2e, #0a0d12)", padding: 40 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ color: "#ff7a18" }}>🏎 Лобби</h1>
          <button className="secondary" onClick={leaveLobby}>Выйти</button>
        </div>

        {Object.keys(challenges).length > 0 && (
          <div style={{ background: "#12161f", border: "1px solid #ff7a18", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Входящие вызовы</h3>
            {Object.entries(challenges).map(([id, ch]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#1a1f2e", borderRadius: 8, marginBottom: 8 }}>
                <span><strong>{ch.fromNick}</strong> вызывает тебя на догонялки</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => acceptChallenge(id)} style={{ padding: "8px 16px", fontSize: 13 }}>Принять</button>
                  <button className="secondary" onClick={() => declineChallenge(id)} style={{ padding: "8px 16px", fontSize: 13 }}>Отказ</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#12161f", border: "1px solid #232a3a", borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Игроки онлайн: {Object.keys(players).length}</h3>
          {Object.entries(players).map(([id, p]) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#1a1f2e", borderRadius: 8, marginBottom: 8 }}>
              <span>
                {p.nick} {id === myId && <span style={{ color: "#8a95a8" }}>(ты)</span>}
              </span>
              {id !== myId && (
                <button onClick={() => challenge(id)} style={{ padding: "8px 16px", fontSize: 13 }}>
                  Вызвать на догонялки
                </button>
              )}
            </div>
          ))}
          {Object.keys(players).length <= 1 && (
            <p style={{ color: "#8a95a8", textAlign: "center", padding: 20 }}>
              Ждём второго игрока... Открой сайт на другом компьютере.
            </p>
          )}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button className="secondary" onClick={() => router.push(`/game?room=solo&role=solo&nick=${encodeURIComponent(nick)}`)}>
            Свободная езда (без соперника)
          </button>
        </div>
      </div>
    </div>
  );
}