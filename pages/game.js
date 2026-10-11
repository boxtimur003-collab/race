import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Game3D from "../components/Game3D";
import HUD from "../components/HUD";
import { Net } from "../lib/net";

export default function Game() {
  const router = useRouter();
  const { room, role, nick: nickParam } = router.query;

  const [playerId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("playerId") || Math.random().toString(36).slice(2, 10);
  });
  const nick = nickParam || "Игрок";

  const [myRole, setMyRole] = useState(role === "host" ? "seeker" : "hider");
  const [otherNick, setOtherNick] = useState("");
  const [scores, setScores] = useState({ me: 0, other: 0 });

  const netRef = useRef(null);
  const otherCarsRef = useRef([]);
  const roleRef = useRef(myRole);

  useEffect(() => { roleRef.current = myRole; }, [myRole]);

  useEffect(() => {
    if (!room || !playerId) return;

    const net = new Net(room, playerId);
    netRef.current = net;
    net.registerDisconnect();

    const unsubState = net.subscribe((others) => {
      otherCarsRef.current = others;
    });

    const unsubRoles = net.subscribeRoles((roles) => {
      // Если хост — задаёт роли
      if (role === "host") {
        if (!roles[playerId]) {
          net.setRoles({
            [playerId]: "seeker",
            ...Object.fromEntries(Object.keys(roles || {}).filter(k => k !== playerId).map(k => [k, "hider"]))
          });
        }
      }
    });

    return () => {
      unsubState();
      unsubRoles();
    };
  }, [room, playerId]);

  const handleStateUpdate = (car, role) => {
    if (!netRef.current) return;
    netRef.current.sendState(car, role);

    // Проверка колизии
    if (roleRef.current === "seeker" && otherCarsRef.current.length > 0) {
      const other = otherCarsRef.current[0];
      if (other.role === "hider") {
        const dist = Math.hypot(car.pos.x - other.x, car.pos.z - other.z);
        if (dist < 3) {
          // Поменять роли
          roleRef.current = "hider";
          setMyRole("hider");
          setScores(s => ({ me: s.me, other: s.other + 1 }));
          if (netRef.current) {
            netRef.current.setRoles({
              [playerId]: "hider",
              [other.id]: "seeker"
            });
          }
        }
      }
    }
  };

  if (!room) return null;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Game3D
        roomId={room}
        playerId={playerId}
        nick={nick}
        onStateUpdate={handleStateUpdate}
        roleRef={roleRef}
        otherCars={otherCarsRef}
      />
      <HUD nick={nick} role={myRole} otherNick={otherNick} scores={scores} />
    </div>
  );
}