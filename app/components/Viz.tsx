"use client";

import { useEffect, useState } from "react";

export function Sparkline({
  points,
  color = "#34d399",
  width = 64,
  height = 20,
  fill = true,
}: {
  points?: number[] | null;
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fillPath = `${path} L${width.toFixed(1)},${height} L0,${height} Z`;
  const last = points[points.length - 1];
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path className="fill" d={fillPath} style={{ fill: color }} />}
      <path className="line" d={path} style={{ stroke: color }} />
      <circle
        cx={(points.length - 1) * stepX}
        cy={height - ((last - min) / range) * (height - 2) - 1}
        r="1.8"
        fill={color}
      />
    </svg>
  );
}

export function ConfidenceArc({
  value,
  color,
  size = 32,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;
  const filled = c * 0.75; // 270° track
  const dash = (Math.min(Math.abs(value), 100) / 100) * filled;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.08)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%" }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        style={{
          transform: "rotate(135deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dasharray 1.5s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </svg>
  );
}

export function CountUp({
  to,
  duration = 1200,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setV(to * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}
