import { useState } from "react";

export default function TrendChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
        Aucune donnée d'activité récente disponible.
      </div>
    );
  }

  const width = 800;
  const height = 200;
  const paddingX = 20;
  const paddingY = 24;

  const maxVal = Math.max(...data.map(d => d.count), 5);
  const stepX = (width - paddingX * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (d.count / maxVal) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const lineD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${lineD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="admin-chart-container" style={{ position: "relative" }}>
      <svg className="admin-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4285f4" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#4285f4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Base line */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="var(--line)"
          strokeWidth="1"
        />

        {/* Shaded Area */}
        <path className="admin-chart-area" d={areaD} />

        {/* Smoothed Line */}
        <path className="admin-chart-line" d={lineD} />

        {/* Interactive Data Points */}
        {points.map((pt, i) => (
          <circle
            key={i}
            className="admin-chart-dot"
            cx={pt.x}
            cy={pt.y}
            r={hovered?.index === i ? 6 : 3.5}
            onMouseEnter={() => setHovered({ index: i, ...pt })}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: `${(hovered.x / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
            transform: "translate(-50%, -125%)",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "5px 10px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            zIndex: 10,
          }}
        >
          <div>{hovered.date}</div>
          <div style={{ color: "var(--blue)" }}>{hovered.count} candidature{hovered.count > 1 ? "s" : ""}</div>
        </div>
      )}
    </div>
  );
}
