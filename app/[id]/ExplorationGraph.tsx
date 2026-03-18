"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { Post, Think } from "@/lib/types";

// ── TYPES ──────────────────────────────────────────────────────────────
type NodeType = "root" | "source" | "insight" | "score";

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;       // primary display label
  fullText?: string;   // full text for modal
  url?: string;        // for source nodes
  labelInfo?: string;  // extra metadata label, e.g owner name for Insight header
  scoreVal?: number;   // raw numeric score for colouring
  val: number;         // physics size
  color: string;
  borderColor?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  // runtime
  w?: number;
  h?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface Props {
  post: Post;
  think: Think | null;
  state: string;
}

// ── COLOURS ─────────────────────────────────────────────────────────────
const C = {
  rootBg:     "#0f172a",
  rootBorder: "#3b82f6",
  rootText:   "#93c5fd",

  sourceBg:     "#0f1f36",
  sourceBorder: "#64748b",
  sourceText:   "#cbd5e1",

  insightBg:     "#0c1a2e",
  insightBorder: "#0ea5e9",
  insightText:   "#bae6fd",

  scoreHoaxBg:   "#1c0a0a",
  scoreHoaxBdr:  "#ef4444",
  scoreHoaxTxt:  "#fca5a5",

  scoreValidBg:  "#091a0f",
  scoreValidBdr: "#22c55e",
  scoreValidTxt: "#86efac",

  scoreNeutBg:   "#131007",
  scoreNeutBdr:  "#eab308",
  scoreNeutTxt:  "#fde047",

  link:          "rgba(255,255,255,0.12)",
  particle:      "rgba(255,255,255,0.7)",
};

function scoreColor(v: number) {
  if (v < 0) return { bg: C.scoreHoaxBg, border: C.scoreHoaxBdr, text: C.scoreHoaxTxt };
  if (v > 0) return { bg: C.scoreValidBg, border: C.scoreValidBdr, text: C.scoreValidTxt };
  return { bg: C.scoreNeutBg, border: C.scoreNeutBdr, text: C.scoreNeutTxt };
}

// ── CANVAS HELPERS ───────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const test = cur + " " + words[i];
    if (ctx.measureText(test).width <= maxW) { cur = test; }
    else { lines.push(cur); cur = words[i]; }
  }
  lines.push(cur);
  return lines;
}

// ── NODE DIMENSIONS ──────────────────────────────────────────────────────
// Score uses radius so w/h here represents the pointer-area bounding box
const SCORE_R = 18; // circle radius for score nodes
const NODE_DIMS: Record<NodeType, { w: number; h: number }> = {
  root:    { w: 130, h: 52  },
  source:  { w: 140, h: 60  },
  insight: { w: 130, h: 56  },
  score:   { w: SCORE_R * 2, h: SCORE_R * 2 },
};

// ── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function ExplorationGraph({ post, think, state }: Props) {
  const graphRef   = useRef<ForceGraphMethods | undefined>(undefined);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dims,      setDims]      = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<{ title: string; body: string; url?: string } | null>(null);

  // Auto-minimize when exploration finishes
  const [minimized, setMinimized] = useState(false);
  useEffect(() => {
    if (state === "analyzing" || state === "completed") {
      const t = setTimeout(() => {
        setMinimized(true);
      }, 1500); // Wait 1.5s after finishing before snapping closed
      return () => clearTimeout(t);
    } else {
      setMinimized(false);
    }
  }, [state]);

  // resize observer
  useEffect(() => {
    const upd = () => {
      if (containerRef.current) setDims({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    };
    upd();
    const ro = new ResizeObserver(upd);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── GRAPH DATA BUILD ────────────────────────────────────────────────
  useEffect(() => {
    setGraphData(prev => {
      const nodeMap = new Map<string, GraphNode>(prev.nodes.map(n => [n.id, n]));
      const linkSet = new Set<string>(prev.links.map(l => {
        const s = typeof l.source === "object" ? (l.source as any).id : l.source;
        const t = typeof l.target === "object" ? (l.target as any).id : l.target;
        return `${s}->${t}`;
      }));
      let added = 0;

      const addNode = (n: GraphNode) => {
        if (!nodeMap.has(n.id)) { nodeMap.set(n.id, n); added++; }
      };
      const addLink = (s: string, t: string) => {
        const key = `${s}->${t}`;
        if (!linkSet.has(key)) linkSet.add(key);
      };

      // L1 – root
      addNode({
        id: "root", type: "root",
        label: post.title || "Topik Analisis",
        val: 30, color: C.rootBorder,
        ...NODE_DIMS.root,
      });

      // L2 + L3
      const sourceConfigs = [
        {
          key:      "official" as const,
          mediaKey:  null,
          display:  `Official: ${think?.official_name ?? "Official"}`,
          url:      think?.official_url ?? undefined,
          content:  think?.official ?? null,
          insightKey: "official_insight" as const,
          scoreKey:   "official_score"   as const,
        },
        { key: "cnbc"   as const, mediaKey: "cnbc"   as const, display: "Media: CNBC Indonesia",  url: think?.cnbc_url   ?? undefined, content: think?.cnbc   ?? null, insightKey: "cnbc_insight"    as const, scoreKey: "cnbc_score"    as const },
        { key: "detik"  as const, mediaKey: "detik"  as const, display: "Media: Detik",           url: think?.detik_url  ?? undefined, content: think?.detik  ?? null, insightKey: "detik_insight"   as const, scoreKey: "detik_score"   as const },
        { key: "kompas" as const, mediaKey: "kompas" as const, display: "Media: Kompas",          url: think?.kompas_url ?? undefined, content: think?.kompas ?? null, insightKey: "kompas_insight"  as const, scoreKey: "kompas_score"  as const },
        { key: "inews"  as const, mediaKey: "inews"  as const, display: "Media: iNews",           url: think?.inews_url  ?? undefined, content: think?.inews  ?? null, insightKey: "inews_insight"   as const, scoreKey: "inews_score"   as const },
        {
          key:      "analysis" as const,
          mediaKey:  null,
          display:  "General Exploration",
          url:      undefined,
          content:  think?.analysis ?? null,
          insightKey: "analysis_insight" as const,
          scoreKey:   "analysis_score"   as const,
        },
      ] as const;

      sourceConfigs.forEach(cfg => {
        if (!think || !think[cfg.key]) return;

        // L2 Source node
        addNode({
          id: cfg.key, type: "source",
          label:    cfg.display,
          fullText: cfg.content ?? undefined,
          url:      cfg.url,
          val: 22, color: C.sourceBorder,
          ...NODE_DIMS.source,
        });
        addLink("root", cfg.key);

        // L3 Insight
        const insightVal = think[cfg.insightKey];
        if (insightVal) {
          const preview = insightVal.length > 160 ? insightVal.slice(0, 160) + "..." : insightVal;
          addNode({
            id: `${cfg.key}-insight`, type: "insight",
            label:    preview,
            labelInfo: cfg.key, // e.g. "cnbc" or "official"
            fullText: insightVal,
            val: 15, color: C.insightBorder,
            ...NODE_DIMS.insight,
          });
          addLink(cfg.key, `${cfg.key}-insight`);
        }

        // L3 Score
        const scoreRaw = think[cfg.scoreKey];
        if (scoreRaw !== null && scoreRaw !== undefined) {
          const sv      = Number(scoreRaw);
          const abs     = Math.abs(sv);
          const sc      = scoreColor(sv);
          const verdictWord = sv < 0 ? "Hoaks" : sv > 0 ? "Valid" : "Netral";
          // label stores "PCT|VERDICT" — split in painter
          addNode({
            id: `${cfg.key}-score`, type: "score",
            label:    `${abs}%|${verdictWord}`,
            scoreVal: sv,
            val: 12, color: sc.border,
            ...NODE_DIMS.score,
          });
          addLink(cfg.key, `${cfg.key}-score`);
        }
      });

      if (added > 0) {
        setTimeout(() => graphRef.current?.zoomToFit(1000, 60), 200);
        return {
          nodes: Array.from(nodeMap.values()),
          links: Array.from(linkSet).map(k => {
            const [s, t] = k.split("->");
            return { source: s, target: t };
          }),
        };
      }
      return prev;
    });
  }, [post.title, think]);

  // zoom in on root when it first appears alone
  useEffect(() => {
    if (graphData.nodes.length === 1) {
      setTimeout(() => {
        graphRef.current?.centerAt(0, 0, 600);
        graphRef.current?.zoom(3, 600);
      }, 100);
    }
  }, [graphData.nodes.length]);

  // ── CUSTOM NODE PAINTER ─────────────────────────────────────────────
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode;
    n.w = NODE_DIMS[n.type].w;
    n.h = NODE_DIMS[n.type].h;

    // ── SCORE: draw as circle ───────────
    if (n.type === "score") {
      const sc = scoreColor(n.scoreVal ?? 0);
      // glow
      ctx.save();
      ctx.shadowColor = sc.border;
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, SCORE_R, 0, Math.PI * 2);
      ctx.fillStyle = sc.bg;
      ctx.fill();
      ctx.restore();
      // border
      ctx.lineWidth   = 2;
      ctx.strokeStyle = sc.border;
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, SCORE_R, 0, Math.PI * 2);
      ctx.stroke();
      // two-line text: pct + verdict
      const [pctStr, verdict] = n.label.split("|");
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = sc.text;
      ctx.font         = `bold 8px Inter,sans-serif`;
      ctx.fillText(pctStr, n.x!, n.y! - 5);
      ctx.font         = `5px Inter,sans-serif`;
      ctx.fillStyle    = `${sc.text}cc`;
      ctx.fillText(verdict, n.x!, n.y! + 7);
      return;
    }

    // ── RECT nodes (root / source / insight) ──
    const W  = n.w!;
    const H  = n.h!;
    const rx = n.x! - W / 2;
    const ry = n.y! - H / 2;
    const r  = 6;

    let bgColor     = "#0c1a2e";
    let borderColor = n.color;
    let labelColor  = "#e2e8f0";
    if (n.type === "root")    { bgColor = C.rootBg;    labelColor = C.rootText; }
    if (n.type === "source")  { bgColor = C.sourceBg;  labelColor = C.sourceText; }
    if (n.type === "insight") { bgColor = C.insightBg; labelColor = C.insightText; }

    // shadow / glow
    ctx.save();
    ctx.shadowColor = borderColor;
    ctx.shadowBlur  = 8;
    roundRect(ctx, rx, ry, W, H, r);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.restore();

    // border
    ctx.lineWidth   = n.type === "root" ? 2.5 : 1.5;
    ctx.strokeStyle = borderColor;
    roundRect(ctx, rx, ry, W, H, r);
    ctx.stroke();

    // header bar for source OR insight
    if (n.type === "source" || n.type === "insight") {
      // Header pill
      ctx.fillStyle = `${borderColor}28`;
      roundRect(ctx, rx, ry, W, 17, r);
      ctx.fill();
      ctx.font         = `bold 4.5px Inter,sans-serif`;
      ctx.fillStyle    = labelColor;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      
      const headerText = n.type === "insight" ? `Insight: ${n.labelInfo}` : n.label;
      ctx.fillText(headerText, n.x!, ry + 8.5);

      if (n.type === "source") {
        // Body: content preview only (URL moved to modal only)
        let bodyY = ry + 20;
        if (n.fullText) {
          ctx.font      = `3.5px Inter,sans-serif`;
          ctx.fillStyle = `${labelColor}bb`;
          const previewLines = wrapLine(ctx, n.fullText.slice(0, 400), W - 10);
          const maxLines = 11;
          previewLines.slice(0, maxLines).forEach((line, i) => {
            ctx.fillText(line, n.x!, bodyY + i * 5);
          });
          if (previewLines.length > maxLines) {
            ctx.fillStyle = "rgba(148,163,184,0.35)";
            ctx.fillText("...", n.x!, bodyY + maxLines * 5);
          }
        }
      } else {
        // Insight block body
        let bodyY = ry + 22;
        ctx.font      = `3.5px Inter,sans-serif`;
        ctx.fillStyle = `${labelColor}ee`;
        const previewLines = wrapLine(ctx, n.label, W - 10);
        previewLines.forEach((line, i) => {
          ctx.fillText(line, n.x!, bodyY + i * 5.5);
        });
      }

      // click hint
      ctx.font      = `2.8px Inter,sans-serif`;
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.fillText("↗ klik untuk detail", n.x!, ry + H - 4);
      return;
    }

    // text (root only here — source/insight returned early above)
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = labelColor;
    
    // Enormous font size for root
    const rootFontSize = 8.5;
    ctx.font = `bold ${rootFontSize}px Inter,sans-serif`;

    const padTop = 5;
    const textW  = W - 10;
    const lines  = wrapLine(ctx, n.label, textW);
    const lh     = rootFontSize + 1.5;
    const totalH = lines.length * lh;
    const startY = ry + padTop + (H - padTop - totalH) / 2 + lh / 2;
    lines.forEach((line, i) => ctx.fillText(line, n.x!, startY + i * lh));
  }, []);

  // ── NODE POINTER AREA ───────────────────────────────────────────────
  const nodePointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode;
    ctx.fillStyle = color;
    if (n.type === "score") {
      ctx.beginPath();
      ctx.arc(n.x!, n.y!, SCORE_R + 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const W = n.w ?? NODE_DIMS[n.type].w;
      const H = n.h ?? NODE_DIMS[n.type].h;
      ctx.fillRect(n.x! - W / 2, n.y! - H / 2, W, H);
    }
  }, []);
  // ── FORCE ENGINE SETUP (longer links) ─────────────────────────────
  const handleEngineStop = useCallback(() => {}, []);
  const applyLinkForce = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;
    
    // Dynamic distance: 75 for root->source, 150 for source->L3
    (fg as any).d3Force("link")?.distance((link: any) => {
      const s = link.source.id || link.source;
      if (s === "root") return 75;
      return 150;
    });
    
    (fg as any).d3Force("charge")?.strength(-600);
    (fg as any).d3ReheatSimulation?.();

    // Restrict max zoom out to bounding box + dynamic tight padding
    setTimeout(() => {
      let padding = 30; // default for L3
      const numNodes = graphData.nodes.length;
      if (numNodes === 1) {
        padding = 150; // extra large buffer for just L1
      } else if (numNodes > 1 && numNodes < 7) {
        padding = 80;  // medium buffer for L2
      }

      fg.zoomToFit(200, padding); 
      setTimeout(() => {
        // read resulting scale and strictly lock it as min bound (max zoom out)
        // this native d3 setting instantly blocks zooming out past this point
        const scale = fg.zoom();
        if (scale && typeof scale === "number") {
          (fg as any).d3Zoom()?.scaleExtent([scale, 4]);
        }
      }, 250); // faster snap
    }, 50);
  }, []);

  // ── CLICK HANDLER ───────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    const n = node as GraphNode;
    if (n.type === "source" && n.fullText) {
      setModal({ title: n.label, body: n.fullText, url: n.url });
    }
    if (n.type === "insight" && n.fullText) {
      setModal({ title: "💡 Insight", body: n.fullText });
    }
  }, []);

  // ── LINK CANVAS PAINTER (side-to-side) ─────────────────────────────
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const s = link.source as GraphNode;
    const t = link.target as GraphNode;
    if (!s.x || !s.y || !t.x || !t.y) return;

    const sW = (s.w ?? NODE_DIMS[s.type].w) / 2;
    const sH = (s.h ?? NODE_DIMS[s.type].h) / 2;
    const tW = (t.w ?? NODE_DIMS[t.type].w) / 2;
    const tH = (t.h ?? NODE_DIMS[t.type].h) / 2;

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const angle = Math.atan2(dy, dx);

    // exit point from source node border
    const sx = s.x + Math.cos(angle) * sW;
    const sy = s.y + Math.sin(angle) * sH;

    // entry point into target node border (opposite direction)
    const tx = t.x - Math.cos(angle) * tW;
    const ty = t.y - Math.sin(angle) * tH;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = "rgba(100,148,220,0.35)";
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  }, []);

  // ── RENDER ──────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div 
        onClick={() => setMinimized(false)}
        className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all text-center animate-fade-in-up border border-sky-700/40"
      >
        <span className="text-white/40 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2">
          <span>+</span>
          Knowledge Graph Tersimpan (Klik untuk melihat ulang)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden animate-fade-in-up"
      style={{ height: "80vh", minHeight: 600, background: "linear-gradient(135deg,#040d1a 0%,#060f1e 100%)" }}
    >
      {/* Header controls (Close button if currently finished but user expanded it) */}
      {(state === "analyzing" || state === "completed") && (
        <button 
          onClick={() => setMinimized(true)}
          className="absolute top-5 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2"
        >
          <span>Tutup Canvas</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>
      )}

      {/* HUD badge */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
          {state === "exploring" ? "AI Building Knowledge Graph..." : "Exploration Complete"}
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-5 right-5 z-10 pointer-events-none flex flex-col gap-1 items-end">
        {[
          { color: C.rootBorder,    label: "Topik Utama" },
          { color: C.sourceBorder,  label: "Sumber" },
          { color: C.insightBorder, label: "Insight" },
          { color: C.scoreValidBdr, label: "Valid (hijau)" },
          { color: C.scoreHoaxBdr,  label: "Hoaks (merah)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[9px] text-white/40">
            <span className="w-2.5 h-2.5 rounded-[2px] inline-block" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Canvas */}
      {dims.width > 0 && dims.height > 0 && (
        <ForceGraph2D
          ref={graphRef}
          width={dims.width}
          height={dims.height}
          graphData={graphData}
          /* custom painters */
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={nodePointerArea}
          linkCanvasObject={paintLink}
          /* no default link rendering since we handle it */
          linkCanvasObjectMode={() => "replace"}
          /* directional particles drawn on TOP of our custom link */
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "rgba(148,210,255,0.7)"}
          /* physics */
          d3VelocityDecay={0.35}
          d3AlphaDecay={0.008}
          /* interactions */
          onNodeClick={handleNodeClick}
          onEngineStop={applyLinkForce}
          cooldownTicks={120}
          nodeLabel={() => ""}  /* disable default tooltip; we use modal */
        />
      )}

      {/* MODAL */}
      {modal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="relative max-w-xl w-[90%] rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-2xl overflow-y-auto max-h-[75vh]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 text-xl leading-none"
              onClick={() => setModal(null)}
            >×</button>

            <h3 className="text-sm font-bold text-sky-300 uppercase tracking-widest mb-3">
              {modal.title}
            </h3>

            {modal.url && (
              <a
                href={modal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-400/70 hover:text-sky-400 mb-3 transition-colors"
              >
                🌐 {modal.url}
              </a>
            )}

            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {modal.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
