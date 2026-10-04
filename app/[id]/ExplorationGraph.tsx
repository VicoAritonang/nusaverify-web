"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { Post, Think } from "@/lib/types";
import { THINK_SOURCES, GROUP_COLOR, type AgentGroup } from "@/lib/investmentData";

// ── TYPES ──────────────────────────────────────────────────────────
type NodeType = "root" | "source" | "insight" | "score";

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  header?: string; // micro-label (group / "INSIGHT")
  fullText?: string;
  url?: string;
  scoreVal?: number;
  color: string;
  accent: string;
  val: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface Props {
  post: Post;
  think: Think | null;
  state: string;
}

// ── COLOR ──────────────────────────────────────────────────────────
const ROOT = { color: "#e9c891", accent: "#f7e9cc" };
const INSIGHT = { color: "#9db8ff", accent: "#dbe5ff" };
const GROUP_ACCENT: Record<AgentGroup, string> = {
  regulator: "#a7f0e6",
  media: "#dbe5ff",
  community: "#fde68a",
  analyst: "#f7e9cc",
};

function scoreColor(v: number) {
  if (v < 0) return { border: "#f87171", text: "#fecaca", bg: "#1a0509" };
  if (v > 0) return { border: "#34d399", text: "#bbf7d0", bg: "#06180e" };
  return { border: "#fcd34d", text: "#fef08a", bg: "#1a1404" };
}

// ── CANVAS HELPERS ─────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const test = cur + " " + words[i];
    if (ctx.measureText(test).width <= maxW) cur = test;
    else {
      lines.push(cur);
      cur = words[i];
      if (lines.length >= maxLines) break;
    }
  }
  if (lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length > 1) last = last.slice(0, -1);
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

const SCORE_R = 24;
const DIMS: Record<NodeType, { w: number; h: number }> = {
  root: { w: 168, h: 58 },
  source: { w: 150, h: 64 },
  insight: { w: 144, h: 58 },
  score: { w: SCORE_R * 2, h: SCORE_R * 2 },
};

export default function ExplorationGraph({ post, think, state }: Props) {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const fontsRef = useRef({ sans: "system-ui, sans-serif", mono: "ui-monospace, monospace" });

  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [modal, setModal] = useState<{ title: string; body: string; url?: string } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(state === "completed");

  // Resolve the actual loaded font families (next/font hashes the names).
  useEffect(() => {
    const cs = getComputedStyle(document.body);
    const sans = cs.getPropertyValue("--font-body-src").trim();
    const mono = cs.getPropertyValue("--font-mono-src").trim();
    fontsRef.current = {
      sans: sans ? `${sans}, system-ui, sans-serif` : "system-ui, sans-serif",
      mono: mono ? `${mono}, ui-monospace, monospace` : "ui-monospace, monospace",
    };
  }, []);

  // Minimize: completed → immediate; analyzing → after a beat; exploring → expanded.
  useEffect(() => {
    if (state === "completed") {
      setMinimized(true);
    } else if (state === "analyzing") {
      const t = setTimeout(() => setMinimized(true), 1600);
      return () => clearTimeout(t);
    } else {
      setMinimized(false);
    }
  }, [state]);

  // Resize observer
  useEffect(() => {
    const upd = () => {
      if (containerRef.current) setDims({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    };
    upd();
    const ro = new ResizeObserver(upd);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [minimized]);

  const totalSources = useMemo(() => {
    if (!think) return 0;
    const rec = think as unknown as Record<string, string | number | null>;
    return THINK_SOURCES.filter((s) => rec[s.key] || rec[`${s.key}_insight`] || rec[`${s.key}_score`] != null).length;
  }, [think]);

  // ── BUILD GRAPH (incremental, additive) ──
  useEffect(() => {
    setGraphData((prev) => {
      const nodeMap = new Map<string, GraphNode>(prev.nodes.map((n) => [n.id, n]));
      const linkSet = new Set<string>(
        prev.links.map((l) => {
          const s = typeof l.source === "object" ? (l.source as { id: string }).id : l.source;
          const t = typeof l.target === "object" ? (l.target as { id: string }).id : l.target;
          return `${s}->${t}`;
        })
      );
      let added = 0;
      const addNode = (n: GraphNode) => {
        if (!nodeMap.has(n.id)) {
          nodeMap.set(n.id, n);
          added++;
        }
      };
      const addLink = (s: string, t: string) => linkSet.add(`${s}->${t}`);

      addNode({ id: "root", type: "root", label: post.title || "Topik Analisis", header: "ROOT NODE", color: ROOT.color, accent: ROOT.accent, val: 30, ...DIMS.root });

      if (think) {
        const rec = think as unknown as Record<string, string | number | null>;
        THINK_SOURCES.forEach((cfg) => {
          const raw = rec[cfg.key] as string | null;
          const insight = rec[`${cfg.key}_insight`] as string | null;
          const scoreRaw = rec[`${cfg.key}_score`];
          const url = (rec[`${cfg.key}_url`] as string | null) ?? undefined;
          if (!raw && !insight && scoreRaw == null) return;

          addNode({
            id: cfg.key,
            type: "source",
            label: cfg.name,
            header: cfg.group,
            fullText: raw ?? insight ?? undefined,
            url,
            color: cfg.color,
            accent: GROUP_ACCENT[cfg.group],
            val: 22,
            ...DIMS.source,
          });
          addLink("root", cfg.key);

          if (insight) {
            addNode({
              id: `${cfg.key}-insight`,
              type: "insight",
              label: insight,
              header: cfg.name,
              fullText: insight,
              color: INSIGHT.color,
              accent: INSIGHT.accent,
              val: 14,
              ...DIMS.insight,
            });
            addLink(cfg.key, `${cfg.key}-insight`);
          }
          if (scoreRaw != null && !Number.isNaN(Number(scoreRaw))) {
            const sv = Number(scoreRaw);
            const sc = scoreColor(sv);
            const word = sv < 0 ? "Hoaks" : sv > 0 ? "Valid" : "Netral";
            addNode({
              id: `${cfg.key}-score`,
              type: "score",
              label: `${Math.abs(sv)}%|${word}`,
              scoreVal: sv,
              color: sc.border,
              accent: sc.text,
              val: 12,
              ...DIMS.score,
            });
            addLink(cfg.key, `${cfg.key}-score`);
          }
        });
      }

      if (added > 0) {
        setTimeout(() => graphRef.current?.zoomToFit(900, 90), 200);
        return {
          nodes: Array.from(nodeMap.values()),
          links: Array.from(linkSet).map((k) => {
            const [s, t] = k.split("->");
            return { source: s, target: t };
          }),
        };
      }
      return prev;
    });
  }, [post.title, think]);

  // Initial framing for the lone root node
  useEffect(() => {
    if (graphData.nodes.length === 1) {
      setTimeout(() => {
        graphRef.current?.centerAt(0, 0, 600);
        graphRef.current?.zoom(2.2, 600);
      }, 100);
    }
  }, [graphData.nodes.length]);

  // ── NODE PAINTER ──
  const paintNode = useCallback(
    (node: object, ctx: CanvasRenderingContext2D) => {
      const n = node as GraphNode;
      const { sans, mono } = fontsRef.current;
      const isHovered = hovered === n.id;

      // ── SCORE (circle gauge) ──
      if (n.type === "score") {
        const sc = scoreColor(n.scoreVal ?? 0);
        const t = performance.now() / 1000;
        const haloR = SCORE_R + 7 + Math.sin(t * 1.8) * 1.6;
        const halo = ctx.createRadialGradient(n.x!, n.y!, SCORE_R, n.x!, n.y!, haloR + 8);
        halo.addColorStop(0, sc.border + "44");
        halo.addColorStop(1, sc.border + "00");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, haloR + 8, 0, Math.PI * 2);
        ctx.fill();

        const body = ctx.createRadialGradient(n.x! - 5, n.y! - 5, 2, n.x!, n.y!, SCORE_R);
        body.addColorStop(0, sc.border + "44");
        body.addColorStop(0.7, sc.bg);
        body.addColorStop(1, "#02040a");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, SCORE_R, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = isHovered ? 2.4 : 1.7;
        ctx.strokeStyle = sc.border;
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, SCORE_R, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 0.6;
        ctx.strokeStyle = sc.border + "55";
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, SCORE_R - 4, 0, Math.PI * 2);
        ctx.stroke();

        const [pct, word] = n.label.split("|");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = sc.text;
        ctx.font = `800 13px ${mono}`;
        ctx.fillText(pct, n.x!, n.y! - 4);
        ctx.font = `700 6.5px ${mono}`;
        ctx.fillStyle = sc.text + "cc";
        ctx.fillText(word.toUpperCase(), n.x!, n.y! + 9);
        return;
      }

      // ── RECT (root / source / insight) ──
      const W = n.w!;
      const H = n.h!;
      const rx = n.x! - W / 2;
      const ry = n.y! - H / 2;
      const rad = 9;

      ctx.save();
      ctx.shadowColor = n.color;
      ctx.shadowBlur = isHovered ? 18 : 9;
      const body = ctx.createLinearGradient(rx, ry, rx, ry + H);
      body.addColorStop(0, "rgba(22,27,44,0.96)");
      body.addColorStop(1, "rgba(9,12,22,0.96)");
      roundRect(ctx, rx, ry, W, H, rad);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = n.type === "root" ? 1.8 : 1.2;
      ctx.strokeStyle = isHovered ? n.accent : n.color;
      roundRect(ctx, rx, ry, W, H, rad);
      ctx.stroke();

      // ── ROOT ──
      if (n.type === "root") {
        const stripe = ctx.createLinearGradient(rx, 0, rx + W, 0);
        stripe.addColorStop(0, n.accent + "00");
        stripe.addColorStop(0.5, n.accent + "cc");
        stripe.addColorStop(1, n.accent + "00");
        ctx.fillStyle = stripe;
        ctx.fillRect(rx + 8, ry + 1, W - 16, 1.4);
        ctx.fillRect(rx + 8, ry + H - 2.4, W - 16, 1.4);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = n.accent + "bb";
        ctx.font = `700 5px ${mono}`;
        ctx.fillText("◆ ROOT NODE", n.x!, ry + 9);

        ctx.fillStyle = "#fff";
        ctx.font = `700 8.5px ${sans}`;
        const lines = wrapLine(ctx, n.label, W - 18, 3);
        const lh = 10;
        const startY = n.y! + 3 - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => ctx.fillText(ln, n.x!, startY + i * lh));
        return;
      }

      // ── SOURCE / INSIGHT header ──
      const headerH = 15;
      const hdr = ctx.createLinearGradient(rx, ry, rx, ry + headerH);
      hdr.addColorStop(0, n.color + "2e");
      hdr.addColorStop(1, n.color + "0e");
      ctx.save();
      roundRect(ctx, rx, ry, W, headerH, rad);
      ctx.clip();
      ctx.fillStyle = hdr;
      ctx.fillRect(rx, ry, W, headerH);
      ctx.restore();

      ctx.strokeStyle = n.color + "44";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rx + 6, ry + headerH);
      ctx.lineTo(rx + W - 6, ry + headerH);
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = n.accent;
      ctx.font = `700 5.4px ${mono}`;
      const glyph = n.type === "insight" ? "◇" : "◈";
      const hd = `${glyph} ${(n.header || "").toUpperCase()}`;
      ctx.fillText(hd.length > 26 ? hd.slice(0, 25) + "…" : hd, rx + 8, ry + headerH / 2 + 0.4);

      // status dot
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(rx + W - 8, ry + headerH / 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // body
      const bodyTop = ry + headerH + 6;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      if (n.type === "source") {
        ctx.fillStyle = "#fff";
        ctx.font = `700 7px ${sans}`;
        ctx.fillText(n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label, rx + 8, bodyTop + 4);
        if (n.fullText) {
          ctx.fillStyle = "rgba(226,232,240,0.6)";
          ctx.font = `400 4.6px ${sans}`;
          const preview = wrapLine(ctx, n.fullText, W - 16, 3);
          preview.forEach((ln, i) => ctx.fillText(ln, rx + 8, bodyTop + 13 + i * 5.6));
        }
      } else {
        ctx.fillStyle = "rgba(237,233,254,0.9)";
        ctx.font = `500 5px ${sans}`;
        const preview = wrapLine(ctx, n.label, W - 16, 5);
        preview.forEach((ln, i) => ctx.fillText(ln, rx + 8, bodyTop + 3 + i * 6));
      }

      // open hint
      ctx.fillStyle = "rgba(148,163,184,0.5)";
      ctx.font = `400 3.4px ${mono}`;
      ctx.textAlign = "right";
      ctx.fillText("↗ open", rx + W - 6, ry + H - 4);
    },
    [hovered]
  );

  const nodePointerArea = useCallback((node: object, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode;
    ctx.fillStyle = color;
    if (n.type === "score") {
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, SCORE_R + 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const W = n.w ?? DIMS[n.type].w;
      const H = n.h ?? DIMS[n.type].h;
      ctx.fillRect(n.x! - W / 2, n.y! - H / 2, W, H);
    }
  }, []);

  // ── LINK PAINTER (curved gradient) ──
  const paintLink = useCallback((link: object, ctx: CanvasRenderingContext2D) => {
    const l = link as { source: GraphNode; target: GraphNode };
    const s = l.source;
    const t = l.target;
    if (s.x == null || s.y == null || t.x == null || t.y == null) return;

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const angle = Math.atan2(dy, dx);
    const sR = s.type === "score" ? SCORE_R : Math.min((s.w ?? 0) / 2, (s.h ?? 0) / 2 + 14);
    const tR = t.type === "score" ? SCORE_R : Math.min((t.w ?? 0) / 2, (t.h ?? 0) / 2 + 14);
    const sx = s.x + Math.cos(angle) * sR;
    const sy = s.y + Math.sin(angle) * (s.type === "score" ? SCORE_R : (s.h ?? 0) / 2);
    const tx = t.x - Math.cos(angle) * tR;
    const ty = t.y - Math.sin(angle) * (t.type === "score" ? SCORE_R : (t.h ?? 0) / 2);

    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const dist = Math.hypot(tx - sx, ty - sy);
    const bow = s.id === "root" ? Math.min(dist * 0.16, 26) : Math.min(dist * 0.26, 52);
    const sign = (t.id.charCodeAt(0) + t.id.length) % 2 === 0 ? 1 : -1;
    const cx = midX + nx * bow * sign;
    const cy = midY + ny * bow * sign;

    let colA = "rgba(233,200,145,0.55)";
    let colB = "rgba(157,184,255,0.35)";
    if (t.type === "insight") {
      colA = "rgba(157,184,255,0.55)";
      colB = "rgba(74,125,255,0.3)";
    } else if (t.type === "score") {
      colA = (t.color || "#34d399") + "99";
      colB = (t.color || "#34d399") + "22";
    } else {
      colA = (t.color || "#9db8ff") + "88";
      colB = (t.color || "#9db8ff") + "22";
    }

    const grd = ctx.createLinearGradient(sx, sy, tx, ty);
    grd.addColorStop(0, colA);
    grd.addColorStop(1, colB);

    ctx.save();
    ctx.shadowColor = colA;
    ctx.shadowBlur = 5;
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.stroke();
  }, []);

  // ── FORCES ──
  const applyForces = useCallback(() => {
    const fg = graphRef.current as unknown as {
      d3Force: (k: string) => { distance?: (fn: (l: object) => number) => void; strength?: (n: number) => void } | undefined;
      d3ReheatSimulation?: () => void;
      zoomToFit: (ms: number, pad: number) => void;
      zoom: () => number;
      d3Zoom?: () => { scaleExtent?: (e: [number, number]) => void } | undefined;
    } | undefined;
    if (!fg) return;
    fg.d3Force("link")?.distance?.((link: object) => {
      const l = link as { source: { id?: string } | string; target: { id?: string } | string };
      const sid = typeof l.source === "object" ? l.source.id : l.source;
      const tid = (typeof l.target === "object" ? l.target.id : l.target) || "";
      if (sid === "root") return 150;
      if (tid.endsWith("-score")) return 78;
      if (tid.endsWith("-insight")) return 100;
      return 140;
    });
    fg.d3Force("charge")?.strength?.(-820);
    fg.d3ReheatSimulation?.();
    setTimeout(() => {
      const n = graphData.nodes.length;
      fg.zoomToFit(800, n === 1 ? 200 : n < 7 ? 130 : 80);
      setTimeout(() => {
        const scale = fg.zoom();
        if (typeof scale === "number") fg.d3Zoom?.()?.scaleExtent?.([scale * 0.7, 6]);
      }, 220);
    }, 60);
  }, [graphData.nodes.length]);

  const handleNodeClick = useCallback((node: object) => {
    const n = node as GraphNode;
    if (n.type === "source" && n.fullText) setModal({ title: n.label, body: n.fullText, url: n.url });
    if (n.type === "insight" && n.fullText) setModal({ title: `Insight · ${n.header}`, body: n.fullText });
  }, []);

  const particleColor = useCallback((link: object) => {
    const t = (link as { target: GraphNode }).target;
    if (t.type === "score") return scoreColor(t.scoreVal ?? 0).border;
    if (t.type === "insight") return "rgba(219,229,255,0.95)";
    return (t.color || "#9db8ff");
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 1 + (i % 3),
        color: i % 3 === 0 ? "rgba(233,200,145,0.55)" : i % 3 === 1 ? "rgba(47,198,180,0.45)" : "rgba(157,184,255,0.5)",
        dur: 4 + (i % 4),
        delay: (i * 0.3) % 3,
      })),
    []
  );

  // ── MINIMIZED BANNER ──
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="lg lg-pill fade-in-up"
        style={{ width: "100%", padding: "14px 20px", border: 0, textAlign: "center", color: "var(--fg-2)", fontSize: 14 }}
      >
        Lihat peta penelusuran <span style={{ color: "var(--fg-4)" }}>· {totalSources || THINK_SOURCES.length} sumber dieksplorasi</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="graph-shell fade-in-up" style={{ height: "76vh", minHeight: 560 }}>
      {/* HUD top */}
      <div style={{ position: "absolute", top: 16, left: 18, right: 18, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="chip" style={{ fontSize: 12.5, padding: "6px 13px", background: "rgba(233,200,145,.12)", border: "1px solid rgba(233,200,145,.32)", color: "var(--champagne-2)" }}>
            {state === "exploring" ? (
              <span className="live-dot" style={{ background: "var(--champagne)" }} />
            ) : (
              <span className="dot-bull" style={{ background: "var(--champagne)", boxShadow: "none" }} />
            )}
            {state === "exploring" ? "Membangun peta penelusuran" : "Peta penelusuran"}
          </span>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-4)" }}>
            {Math.max(0, graphData.nodes.length)} node
          </span>
        </div>
        {(state === "analyzing" || state === "completed") && (
          <button className="btn-ghost" style={{ pointerEvents: "auto", padding: "6px 12px", fontSize: 12.5 }} onClick={() => setMinimized(true)}>
            Ringkas
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{ position: "absolute", left: 18, bottom: 18, zIndex: 5, pointerEvents: "none" }}>
        <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>
          Legenda
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "Klaim utama", color: ROOT.color },
            { label: "Regulator · BEI · OJK", color: GROUP_COLOR.regulator },
            { label: "Media · CNBC · Kontan · Bisnis", color: GROUP_COLOR.media },
            { label: "Sentimen komunitas retail", color: GROUP_COLOR.community },
            { label: "Analis · sintesis multi-aset", color: GROUP_COLOR.analyst },
            { label: "Skor per sumber", color: "#34d399" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 7, background: l.color }} />
              <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint */}
      <div style={{ position: "absolute", right: 18, bottom: 18, zIndex: 5, pointerEvents: "none" }}>
        <div className="glass" style={{ borderRadius: 999, padding: "7px 14px" }}>
          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>
            Scroll untuk zoom · seret · klik node
          </span>
        </div>
      </div>

      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
        {particles.map((p, i) => (
          <span
            key={i}
            className="graph-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: "0 0 6px currentColor",
              animation: `float ${p.dur}s ease-in-out infinite, breathe ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Scan line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(233,200,145,.45), transparent)", animation: "hudScan 4s ease-in-out infinite", pointerEvents: "none", zIndex: 4 }} />

      {/* Canvas */}
      {dims.width > 0 && dims.height > 0 && (
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          <ForceGraph2D
            ref={graphRef}
            width={dims.width}
            height={dims.height}
            graphData={graphData}
            backgroundColor="rgba(0,0,0,0)"
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={nodePointerArea}
            linkCanvasObject={paintLink}
            linkCanvasObjectMode={() => "replace"}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={particleColor}
            d3VelocityDecay={0.34}
            d3AlphaDecay={0.012}
            onNodeClick={handleNodeClick}
            onNodeHover={(node: object | null) => setHovered(node ? (node as GraphNode).id : null)}
            onEngineStop={applyForces}
            cooldownTicks={120}
            nodeLabel={() => ""}
            enableZoomInteraction
            enablePanInteraction
            enableNodeDrag
          />
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="absolute inset-0 flex items-center justify-center fade-in-up" style={{ zIndex: 50, background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)" }} onClick={() => setModal(null)}>
          <div
            className="glass-elev"
            style={{ maxWidth: 560, width: "90%", borderRadius: 28, padding: 28, maxHeight: "75vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              aria-label="Tutup"
              style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 999, border: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-2)", background: "rgba(255,255,255,.08)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span className="dot-bull" style={{ background: "var(--champagne)", boxShadow: "none" }} />
              <h3 className="h-display" style={{ margin: 0, fontSize: 18, color: "var(--fg)", paddingRight: 36 }}>
                {modal.title}
              </h3>
            </div>
            {modal.url && (
              <a href={modal.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ display: "inline-block", fontSize: 12, color: "var(--champagne)", marginBottom: 14, wordBreak: "break-all" }}>
                ↗ {modal.url}
              </a>
            )}
            <p style={{ margin: 0, color: "var(--fg-2)", fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>{modal.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
