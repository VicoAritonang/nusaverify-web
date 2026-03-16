"use client";

import { useState, useEffect, useRef } from "react";
import { Think } from "@/lib/types";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

// ─────────────────────────────────────────────────────────────────────────────
// NODE LAYOUT PLAN
// Canvas is 3000×3000. The mind-map origin is at (1500,1500).
// All coordinates below are RELATIVE to origin (positive = right/down).
//
//  L1:  Title              (0,    0)     w=450, h=100
//  L2:  Official          (0,   -430)    w=380, h=250  →  above
//       Media            (-560,  290)    w=380, h=250  →  bottom-left
//       Analysis          (560,  290)    w=380, h=250  →  bottom-right
//  L3:  OfficialInsight  (-480, -430)   w=260  →  LEFT of Official
//       OfficialScore    ( 480, -430)   w=260  →  RIGHT of Official
//       MediaInsight     (-940,  290)   w=260  →  FAR LEFT of Media
//       MediaScore       (-560,  550)   w=260  →  BELOW Media
//       AnalysisInsight  ( 560,  550)   w=260  →  BELOW Analysis
//       AnalysisScore    ( 940,  290)   w=260  →  FAR RIGHT of Analysis
//
// HALF-SIZES used for edge endpoint calculation:
//   L1:  hw=225, hh=50
//   L2:  hw=190, hh=125
//   L3:  hw=130
//
// EDGE ENDPOINTS (border-of-source → border-of-target):
//   toOfficial:        (0, -50)   → (0, -430+125) =  (0, -305)
//   toMedia:          (-225, 20)  → (-560+190, 290) = (-370, 290)
//   toAnalysis:       ( 225, 20)  → ( 560-190, 290) = ( 370, 290)
//
//   officialToInsight: (-190,-430) → (-480+130,-430) = (-350,-430)
//   officialToScore:   ( 190,-430) → ( 480-130,-430) = ( 350,-430)
//   mediaToInsight:    (-560-190,290) → (-940+130,290) = (-810,290)
//   mediaToScore:      (-560,-430+125+250)=(-560,165) ← wrong; use bottom of media:
//                      (-560, 290+125) = (-560,415) → (-560,550-40) = (-560,510)
//   analysisToInsight: (560,290+125)=(560,415) → (560,550-40)=(560,510)
//   analysisToScore:   (560+190,290) → (940-130,290) = (810,290)
// ─────────────────────────────────────────────────────────────────────────────

const OX = 1124;  // Center X for 2248px width
const OY = 782.5; // Center Y for 1565px height

// Absolute canvas coords for <path> d attributes
const C = (x: number, y: number) => `${OX + x},${OY + y}`;

// Pre-built SVG path strings using canvas-absolute coords.
// Control points have a ±30px perpendicular bow so they are never
// degenerate (identical axis) — browsers skip stroke-dashoffset on those.
const EDGES = {
  // L1 → L2: Title top → Official bottom (vertical, bow left)
  toOfficial:        `M ${C(0,-87)} C ${C(-30,-210)} ${C(-30,-295)} ${C(0,-305)}`,
  // L1 → L2: Title left-side → Media right-side (diagonal)
  toMedia:           `M ${C(-225,20)} C ${C(-330,50)} ${C(-360,290)} ${C(-370,290)}`,
  // L1 → L2: Title right-side → Analysis left-side (diagonal)
  toAnalysis:        `M ${C(225,20)} C ${C(330,50)} ${C(360,290)} ${C(370,290)}`,

  // Official → OfficialInsight (horizontal, bow up)
  officialToInsight: `M ${C(-190,-430)} C ${C(-270,-455)} ${C(-330,-455)} ${C(-350,-430)}`,
  // Official → OfficialScore (horizontal, bow up)
  officialToScore:   `M ${C(190,-430)} C ${C(270,-455)} ${C(330,-455)} ${C(350,-430)}`,

  // Media → MediaInsight (horizontal, bow up)
  mediaToInsight:    `M ${C(-750,290)} C ${C(-790,265)} ${C(-810,265)} ${C(-810,290)}`,
  // Media → MediaScore (vertical, bow left)
  mediaToScore:      `M ${C(-560,415)} C ${C(-590,458)} ${C(-590,510)} ${C(-560,510)}`,

  // Analysis → AnalysisInsight (vertical, bow right)
  analysisToInsight: `M ${C(560,415)} C ${C(590,458)} ${C(590,510)} ${C(560,510)}`,
  // Analysis → AnalysisScore (horizontal, bow up)
  analysisToScore:   `M ${C(750,290)} C ${C(790,265)} ${C(810,265)} ${C(810,290)}`,
};

// Node positions (canvas absolute = origin + relative)
const P = (x: number, y: number) => ({ cx: OX + x, cy: OY + y });
const NODES = {
  official:        P(0,    -430),
  media:           P(-560,  290),
  analysis:        P( 560,  290),
  officialInsight: P(-480, -430),
  officialScore:   P( 480, -430),
  mediaInsight:    P(-940,  290),
  mediaScore:      P(-560,  550),
  analysisInsight: P( 560,  550),
  analysisScore:   P( 940,  290),
};

interface Props {
  think: Think;
  postTitle: string;
  category: string;
  state: string;
  exploringFinished: boolean;
}

export default function ExploringBox({ think, postTitle, category, state, exploringFinished }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (state === "exploring") setIsOpen(true);
  }, [state]);

  const isPolitic = category === "politic";
  const stroke = isPolitic ? "#22d3ee" : "#818cf8";
  const theme = {
    color: isPolitic ? "text-cyan-400" : "text-indigo-400",
    border: isPolitic ? "border-cyan-500/30" : "border-indigo-500/30",
    glow: isPolitic ? "shadow-[0_0_20px_rgba(34,211,238,0.35)]" : "shadow-[0_0_20px_rgba(99,102,241,0.35)]",
    glowClass: isPolitic ? "bg-cyan-500" : "bg-indigo-500",
    pingClass: isPolitic ? "bg-cyan-500" : "bg-indigo-500",
    barClass: isPolitic ? "bg-cyan-500" : "bg-indigo-500",
    stroke,
  };

  const isOfficialLoaded = !!think.official;
  const isMediaLoaded    = !!think.media;
  const isAnalysisLoaded = !!think.analysis;
  const isL3OfficialLoaded = !!think.official_insight;
  const isL3MediaLoaded    = !!think.media_insight;
  const isL3AnalysisLoaded = !!think.analysis_insight;

  const hasL2Any = isOfficialLoaded || isMediaLoaded || isAnalysisLoaded;
  const hasL3Any = isL3OfficialLoaded || isL3MediaLoaded || isL3AnalysisLoaded;
  const isComplete =
    isOfficialLoaded && isMediaLoaded && isAnalysisLoaded &&
    isL3OfficialLoaded && isL3MediaLoaded && isL3AnalysisLoaded &&
    think.official_score !== null && think.media_score !== null && think.analysis_score !== null;

  // Staged reveal: L2 nodes appear ~3s after edge drawing begins
  const [showL2, setShowL2] = useState(false);
  const [showL3Official, setShowL3Official] = useState(false);
  const [showL3Media, setShowL3Media]       = useState(false);
  const [showL3Analysis, setShowL3Analysis] = useState(false);

  useEffect(() => {
    const to = setTimeout(() => setShowL2(true), 3000);
    return () => clearTimeout(to);
  }, []);
  useEffect(() => {
    if (!isOfficialLoaded) return;
    const to = setTimeout(() => setShowL3Official(true), 3000);
    return () => clearTimeout(to);
  }, [isOfficialLoaded]);
  useEffect(() => {
    if (!isMediaLoaded) return;
    const to = setTimeout(() => setShowL3Media(true), 3000);
    return () => clearTimeout(to);
  }, [isMediaLoaded]);
  useEffect(() => {
    if (!isAnalysisLoaded) return;
    const to = setTimeout(() => setShowL3Analysis(true), 3000);
    return () => clearTimeout(to);
  }, [isAnalysisLoaded]);

  const gridColor = isPolitic ? "rgba(34,211,238,0.05)" : "rgba(99,102,241,0.05)";

  return (
    <>
      {/* ── TRIGGER BUTTON ── */}
      <div
        onClick={() => setIsOpen(true)}
        className={`glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all text-center animate-fade-in-up border ${theme.border} flex items-center justify-center gap-3`}
      >
        {state === "exploring" ? (
          <>
            <span className={`w-2 h-2 rounded-full animate-ping ${theme.pingClass}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.color}`}>
              Melakukan Explorasi . . . (Buka Canvas)
            </span>
          </>
        ) : (
          <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">
            + Explorasi Selesai (Buka Canvas)
          </span>
        )}
      </div>

      {/* ── FULLSCREEN CANVAS ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#050c1a] overflow-hidden font-mono text-white animate-fade-in-up">
          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className={`absolute top-6 right-6 p-3 rounded-xl border ${theme.border} bg-black/40 hover:bg-black/80 transition-all z-[60] shadow-lg`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>

          {/* HUD */}
          <div className="absolute top-6 left-6 pointer-events-none opacity-50 flex flex-col gap-1 z-[60]">
            <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${theme.color}`}>System_Init // {category}</span>
            <span className="text-white/30 text-[9px] font-mono">LAT: -6.2088 | LNG: 106.8456</span>
            <div className={`w-16 h-px bg-current mt-1 ${theme.color}`} />
          </div>
          <div className="absolute bottom-6 left-6 z-[60] pointer-events-none">
            {isComplete
              ? <span className="text-white/30 text-[9px] uppercase tracking-widest">[ Scroll: Zoom ] [ Drag: Pan ]</span>
              : <span className={`text-[9px] uppercase tracking-widest animate-pulse ${theme.color}`}>[ Mindmap Sedang Dibentuk... ]</span>
            }
          </div>

          {/* Cursor position debug overlay */}
          <div className="absolute bottom-6 right-6 z-[60] pointer-events-none">
            <div className={`px-3 py-2 rounded-lg bg-black/60 border ${theme.border} font-mono`}>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">cursor </span>
              <span className={`text-[11px] font-bold ${theme.color}`}>
                x:{cursor.x > 0 ? '+' : ''}{cursor.x} y:{cursor.y > 0 ? '+' : ''}{cursor.y}
              </span>
            </div>
          </div>

          {/* ── TRANSFORM WRAPPER ── */}
          <div className="w-full h-full relative" id="zoom-container">
            <TransformWrapper
              initialScale={1}
              minScale={0.1} // Allows zooming out to see full box
              maxScale={2}   // Allows zooming in
              centerOnInit={false}
              limitToBounds={false}
              wheel={{ step: 0.08, disabled: !isComplete }}
              panning={{ disabled: !isComplete }}
            >
              <AutoZoomController hasL2={hasL2Any} hasL3={hasL3Any} />
              <ViewportDebug theme={theme} />
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "2248px", height: "1565px", cursor: isComplete ? "grab" : "default" }}
              >
              {/* Canvas grid — track mouse for debug coords */}
              <div
                className="relative w-full h-full"
                style={{
                  backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  // The container is dynamically sized but centered.
                  // Center of container is (rect.width/2, rect.height/2).
                  // Origin offset (0,0) is exactly at the center of this container.
                  setCursor({
                    x: Math.round(e.clientX - rect.left - rect.width / 2),
                    y: Math.round(e.clientY - rect.top  - rect.height / 2),
                  });
                }}
              >
                {/* ── BOUNDING BOXES FOR AUTO-ZOOM ── */}
                {/* These invisible boxes correspond to the exact boundaries requested by user */}
                {/* L1: -120,-50 to 120,50 (Width: 240, Height: 100) */}
                <div id="bound-l1" className="absolute pointer-events-none" style={{ left: OX - 120, top: OY - 50, width: 240, height: 100 }} />
                {/* L2: -338,-264 to 338,194 (Width: 676, Height: 458) */}
                <div id="bound-l2" className="absolute pointer-events-none" style={{ left: OX - 338, top: OY - 264, width: 676, height: 458 }} />
                {/* L3: User requested max bounds (Width: 2248, Height: 1565) centered at 0,0 */}
                <div id="bound-l3" className="absolute pointer-events-none" style={{ left: OX - 1124, top: OY - 782.5, width: 2248, height: 1565 }} />

                {/* ── SVG LAYER (full canvas, origin at center) ── */}
                <svg
                  style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}
                >
                  <defs>
                    <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* L1 → L2 (always draw on open) */}
                  <AnimatedEdge path={EDGES.toOfficial}  stroke={stroke} />
                  <AnimatedEdge path={EDGES.toMedia}     stroke={stroke} />
                  <AnimatedEdge path={EDGES.toAnalysis}  stroke={stroke} />

                  {/* L2 → L3 (draw when data arrives) */}
                  {isOfficialLoaded && <AnimatedEdge path={EDGES.officialToInsight} stroke={stroke} />}
                  {isOfficialLoaded && <AnimatedEdge path={EDGES.officialToScore}   stroke={stroke} />}
                  {isMediaLoaded    && <AnimatedEdge path={EDGES.mediaToInsight}    stroke={stroke} />}
                  {isMediaLoaded    && <AnimatedEdge path={EDGES.mediaToScore}      stroke={stroke} />}
                  {isAnalysisLoaded && <AnimatedEdge path={EDGES.analysisToInsight} stroke={stroke} />}
                  {isAnalysisLoaded && <AnimatedEdge path={EDGES.analysisToScore}   stroke={stroke} />}
                </svg>

                {/* ── L1: TITLE NODE — centered at (OX,OY) = (1000,600) ── */}
                <NodeWrapper cx={OX} cy={OY}>
                  <div className="w-[450px] text-center animate-node-pop">
                    <div className={`relative glass rounded-2xl p-8 border-2 ${theme.border} bg-black/80 shadow-2xl backdrop-blur-xl ${theme.glow}`}>
                      <div className={`absolute -inset-2 opacity-15 blur-2xl rounded-3xl ${theme.glowClass}`} />
                      <h3 className={`relative text-xl font-black leading-relaxed ${theme.color} uppercase tracking-wider`}>
                        {postTitle}
                      </h3>
                    </div>
                  </div>
                </NodeWrapper>

                {/* ── L2 NODES ── */}
                <ContentNode cx={NODES.official.cx}  cy={NODES.official.cy}  show={showL2} theme={theme} title={isPolitic ? "AKUN RESMI" : "JURNAL / PAPER"} isLoaded={isOfficialLoaded} content={think.official} />
                <ContentNode cx={NODES.media.cx}     cy={NODES.media.cy}     show={showL2} theme={theme} title="MEDIA TERPERCAYA"  isLoaded={isMediaLoaded}    content={think.media} />
                <ContentNode cx={NODES.analysis.cx}  cy={NODES.analysis.cy}  show={showL2} theme={theme} title="LOGIKA MENDALAM"   isLoaded={isAnalysisLoaded} content={think.analysis} />

                {/* ── L3 NODES ── */}
                <ResultNode cx={NODES.officialInsight.cx}  cy={NODES.officialInsight.cy}  show={showL3Official} theme={theme} title="INSIGHT" isLoaded={isL3OfficialLoaded}            content={think.official_insight} />
                <ResultNode cx={NODES.officialScore.cx}    cy={NODES.officialScore.cy}    show={showL3Official} theme={theme} title="SCORE"   isLoaded={think.official_score !== null}  content={think.official_score}   isScore />
                <ResultNode cx={NODES.mediaInsight.cx}     cy={NODES.mediaInsight.cy}     show={showL3Media}    theme={theme} title="INSIGHT" isLoaded={isL3MediaLoaded}               content={think.media_insight} />
                <ResultNode cx={NODES.mediaScore.cx}       cy={NODES.mediaScore.cy}       show={showL3Media}    theme={theme} title="SCORE"   isLoaded={think.media_score !== null}     content={think.media_score}      isScore />
                <ResultNode cx={NODES.analysisInsight.cx}  cy={NODES.analysisInsight.cy}  show={showL3Analysis} theme={theme} title="INSIGHT" isLoaded={isL3AnalysisLoaded}            content={think.analysis_insight} />
                <ResultNode cx={NODES.analysisScore.cx}    cy={NODES.analysisScore.cy}    show={showL3Analysis} theme={theme} title="SCORE"   isLoaded={think.analysis_score !== null}  content={think.analysis_score}   isScore />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
}

// ── AUTO-ZOOM CONTROLLER ──
function AutoZoomController({ hasL2, hasL3 }: { hasL2: boolean; hasL3: boolean }) {
  const { zoomToElement } = useControls();
  const prevHasL2 = useRef(false);
  const prevHasL3 = useRef(false);

  // Initial load: Target L1 immediately
  useEffect(() => {
    // A small delay ensures the TransformWrapper layout is ready
    setTimeout(() => {
      // Scale padding factor (1 means fit exactly to width/height padding, 0.9 leaves margin)
      zoomToElement("bound-l1", 0.9, 0); 
    }, 10);
  }, [zoomToElement]);

  useEffect(() => {
    if (hasL3 && !prevHasL3.current) {
      prevHasL3.current = true;
      setTimeout(() => zoomToElement("bound-l3", 1, 900), 300);
    } else if (hasL2 && !prevHasL2.current) {
      prevHasL2.current = true;
      setTimeout(() => zoomToElement("bound-l2", 0.95, 900), 300);
    }
  }, [hasL2, hasL3, zoomToElement]);

  return null;
}

// ── VIEWPORT DEBUGGER ──
import { useTransformEffect } from "react-zoom-pan-pinch";
function ViewportDebug({ theme }: { theme: any }) {
  const [viewport, setViewport] = useState({ w: 0, h: 0, scale: 1 });

  useTransformEffect(({ state }) => {
    const container = document.getElementById("zoom-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = state.scale;
    setViewport({
      w: Math.round(rect.width / scale),
      h: Math.round(rect.height / scale),
      scale: Math.round(scale * 100) / 100
    });
  });

  return (
    <div className="absolute top-6 right-6 z-[60] pointer-events-none">
      <div className={`px-3 py-2 rounded-lg bg-black/60 border ${theme.border} font-mono flex flex-col items-end gap-1`}>
        <span className="text-[10px] text-white/40 uppercase tracking-widest">Viewport Coverage</span>
        <span className={`text-[11px] font-bold ${theme.color}`}>
          W: {viewport.w}px × H: {viewport.h}px
        </span>
        <span className="text-[9px] text-white/30">Target Max Bounds: 1600x1200 | Scale: {viewport.scale}x</span>
      </div>
    </div>
  );
}

// ── WRAPPER: centers a node at (cx, cy) in the canvas ──
function NodeWrapper({ cx, cy, children }: { cx: number; cy: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute"
      style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}
    >
      {children}
    </div>
  );
}

// ── ANIMATED SVG EDGE ──
// Using a unique key forces React to unmount+remount the element,
// which restarts the CSS animation cleanly whenever a new edge appears.
let edgeCounter = 0;
function AnimatedEdge({ path, stroke }: { path: string; stroke: string }) {
  const id = useRef(`edge-${++edgeCounter}`).current;
  return (
    <path
      key={id}
      d={path}
      fill="none"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      filter="url(#edgeGlow)"
      className="animate-draw-edge-slow"
      style={{ opacity: 0.85 }}
    />
  );
}

// ── L2 CONTENT NODE ──
function ContentNode({ cx, cy, show, title, isLoaded, content, theme }: any) {
  if (!show) return null;
  return (
    <NodeWrapper cx={cx} cy={cy}>
      <div className="w-[380px] animate-node-reveal">
        <div className={`bg-[#090f23] rounded-xl overflow-hidden shadow-2xl border-l-2 border-t-2 ${theme.border}`}
             style={{ borderRight: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className={`px-5 py-3 border-b ${theme.border} bg-white/[0.03] flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isLoaded ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">{title}</span>
            </div>
            <span className="text-[10px] font-mono text-white/20">L2</span>
          </div>
          <div className="relative p-5 h-[220px] overflow-y-auto css-scrollbar text-white/70 text-sm leading-relaxed">
            {!isLoaded ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-60 space-y-4">
                <svg className="animate-[spin_2s_linear_infinite] w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="20">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-[11px] uppercase font-mono tracking-widest ${theme.color}`}>Awaiting Data...</span>
                  <span className="text-[9px] text-white/20 font-mono">ESTABLISHING UPLINK</span>
                </div>
              </div>
            ) : (
              <TypewriterText text={content ?? ""} theme={theme} />
            )}
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
}

// ── L3 RESULT NODE ──
function ResultNode({ cx, cy, show, title, isLoaded, content, theme, isScore = false }: any) {
  if (!show) return null;
  return (
    <NodeWrapper cx={cx} cy={cy}>
      <div className={`flex flex-col p-4 rounded-xl bg-[#090f23] border ${theme.border} shadow-2xl w-[260px] animate-node-reveal`}>
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/40">{title}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isLoaded ? "bg-emerald-400" : "bg-red-400 animate-ping"}`} />
        </div>
        <div className="w-full">
          {!isLoaded ? (
            <div className="h-10 flex flex-col items-center justify-center gap-2">
              <div className={`w-full h-0.5 rounded-full ${theme.barClass} opacity-30 animate-pulse`} />
              <span className="text-[9px] uppercase tracking-widest text-white/25">Calculating...</span>
            </div>
          ) : isScore ? (
            <div className="flex justify-center py-1">
              <span className={`text-4xl font-black ${theme.color} drop-shadow-[0_0_18px_currentColor]`}>
                {Number(content) > 0 ? `+${content}` : content}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-white/70 leading-relaxed font-sans max-h-36 overflow-y-auto css-scrollbar">
              <TypewriterText text={content ?? ""} theme={theme} />
            </div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
}

// ── TYPEWRITER ──
function TypewriterText({ text, theme }: { text: string; theme: any }) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping]       = useState(true);

  useEffect(() => {
    let i = 0;
    setTyping(true);
    setDisplayed("");
    const t = setInterval(() => {
      if (i < text.length) {
        setDisplayed((p) => p + text.slice(i, i + 5));
        i += 5;
      } else {
        setTyping(false);
        clearInterval(t);
      }
    }, 15);
    return () => clearInterval(t);
  }, [text]);

  return <span className={typing ? `typewriter-cursor ${theme.border}` : ""}>{displayed}</span>;
}
