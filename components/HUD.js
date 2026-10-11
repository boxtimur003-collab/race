export default function HUD({ nick, role, otherNick, scores }) {
  return (
    <>
      <div style={{
        position: "fixed", top: 16, left: 16,
        background: "rgba(0,0,0,0.7)", padding: 16, borderRadius: 12,
        border: "1px solid rgba(255,122,24,0.5)", zIndex: 10, minWidth: 220
      }}>
        <div style={{ fontSize: 13, color: "#8a95a8", marginBottom: 4 }}>Ты:</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{nick}</div>
        <div style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 999,
          background: role === "seeker" ? "#ff2222" : "#2288ff",
          fontSize: 12, fontWeight: 700, textTransform: "uppercase"
        }}>
          {role === "seeker" ? "🎯 Водящий" : "🥷 Прячусь"}
        </div>
      </div>

      {otherNick && (
        <div style={{
          position: "fixed", top: 16, right: 16,
          background: "rgba(0,0,0,0.7)", padding: 16, borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.2)", zIndex: 10, minWidth: 180
        }}>
          <div style={{ fontSize: 13, color: "#8a95a8", marginBottom: 4 }}>Соперник:</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{otherNick}</div>
        </div>
      )}

      <div style={{
        position: "fixed", bottom: 16, left: 16,
        background: "rgba(0,0,0,0.7)", padding: 12, borderRadius: 12,
        fontSize: 13, color: "#8a95a8", zIndex: 10
      }}>
        <div><strong style={{ color: "#fff" }}>WASD</strong> — движение</div>
        <div><strong style={{ color: "#fff" }}>Пробел</strong> — дрифт</div>
      </div>

      {scores && (
        <div style={{
          position: "fixed", bottom: 16, right: 16,
          background: "rgba(0,0,0,0.7)", padding: 16, borderRadius: 12,
          zIndex: 10, textAlign: "right"
        }}>
          <div style={{ fontSize: 12, color: "#8a95a8" }}>Счёт</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ff7a18" }}>
            {scores.me} : {scores.other}
          </div>
        </div>
      )}
    </>
  );
}