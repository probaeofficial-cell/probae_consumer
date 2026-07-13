"use client";

/**
 * FrameSequenceCanvas — Production-grade scroll-driven frame animation
 * ─────────────────────────────────────────────────────────────────────
 *
 * Loading strategy (zero wasted time):
 *   • GSAP modules are imported in PARALLEL with frame loading — not after.
 *   • Frame 0 is loaded FIRST (priority), shown immediately, overlay fades.
 *   • Remaining 239 frames stream in the background while the user reads the hero.
 *   • Loading overlay has a smooth opacity transition — no flash or jump.
 *
 * Blending strategy:
 *   • Top edge gradient fades from page background (#F8F9FA) → transparent.
 *   • Bottom edge gradient fades from transparent → white (menu section colour).
 *   • Left/right edge gradients feather the dark frame into the grid background.
 *   • Result: the frame floats naturally inside the page with no hard cut.
 *
 * Animation:
 *   Phase 1 (0–12% scroll): bowl pops up — opacity, y, scale entrance.
 *   Phase 2 (12–100% scroll): frame scrub forward/backward (bidirectional).
 *   scrub: 2 — 2 s momentum lag for cinematic feel.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
// Match your page's background colours exactly so the gradients blend perfectly.
const PAGE_BG    = "#F8F9FA"; // from globals.css .bg-grid-pattern
const SECTION_BG = "#ffffff"; // menu section below

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  frameCount?:     number;
  frameBasePath?:  string;
  frameExtension?: string;
  frameDigits?:    number;
  scrollHeight?:   string;
  overlayText?:    string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildSrc(base: string, i: number, d: number, ext: string) {
  return `${base}${String(i).padStart(d, "0")}.${ext}`;
}

/**
 * object-fit: contain — full frame always visible, letterboxed if needed.
 * Faster than cover because no clamping arithmetic is needed.
 */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw:  number,
  ch:  number
) {
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw    = img.naturalWidth  * scale;
  const dh    = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - dw) * 0.5, (ch - dh) * 0.5, dw, dh);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function FrameSequenceCanvas({
  frameCount     = 240,
  frameBasePath  = "/frames/frame_",
  frameExtension = "webp",
  frameDigits    = 3,
  scrollHeight   = "350vh",
  overlayText    = "Every ingredient, precisely placed.",
}: Props) {
  // ── Refs ───────────────────────────────────────────────────────────────────
  const sectionRef    = useRef<HTMLDivElement>(null);
  const wrapRef       = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const framesRef     = useRef<HTMLImageElement[]>([]);
  const idxRef        = useRef(0);
  const tickPendingRef= useRef(false);

  // ── State — three phases ───────────────────────────────────────────────────
  //   "loading"  → progress bar visible, overlay opaque
  //   "ready"    → GSAP set up, overlay faded, scroll active
  //   "error"    → first frame failed to load
  // No progress tracking needed — overlay disappears after just frame 0 loads.
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  // ── DPR-aware canvas resize ────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = c.offsetWidth;
    const h   = c.offsetHeight;
    c.width   = Math.round(w * dpr);
    c.height  = Math.round(h * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const img = framesRef.current[idxRef.current];
    if (img?.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, w, h);
      drawContain(ctx, img, w, h);
    }
  }, []);

  // ── Render one frame ───────────────────────────────────────────────────────
  const renderFrame = useCallback((raw: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx    = c.getContext("2d");
    if (!ctx)    return;
    const frames = framesRef.current;
    if (!frames.length) return;

    const idx = Math.max(0, Math.min(frames.length - 1, Math.round(raw)));
    idxRef.current = idx;
    const img = frames[idx];
    if (!img?.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = c.width  / dpr;
    const h   = c.height / dpr;
    ctx.clearRect(0, 0, w, h);
    drawContain(ctx, img, w, h);
  }, []);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let stInst: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;
    let ro: ResizeObserver | null = null;

    async function run() {
      const imgs: HTMLImageElement[] = new Array(frameCount);

      const loadOne = (i: number) =>
        new Promise<void>((res) => {
          const img = new Image();
          img.src   = buildSrc(frameBasePath, i + 1, frameDigits, frameExtension);
          img.onload  = res as () => void;
          img.onerror = res as () => void; // skip broken frames gracefully
          imgs[i] = img;
        });

      // ── Start GSAP + frame 0 loading simultaneously ───────────────────────
      // Both kick off at the same instant. The overlay disappears the moment
      // BOTH resolve — typically well under 200 ms on a decent connection.
      const gsapPromise = Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ] as const);

      await loadOne(0); // single WebP — very fast
      if (cancelled) return;

      if (!imgs[0]?.complete || imgs[0].naturalWidth === 0) {
        setPhase("error");
        return;
      }

      // Frame 0 is ready — paint it immediately so the canvas is never blank.
      framesRef.current = imgs;
      resizeCanvas();
      renderFrame(0);

      // ── ResizeObserver ─────────────────────────────────────────────────────
      ro = new ResizeObserver(() => { if (!cancelled) resizeCanvas(); });
      if (canvasRef.current) ro.observe(canvasRef.current);

      // ── GSAP setup — resolves almost instantly (loaded in parallel) ────────
      const [gsapMod, { ScrollTrigger }] = await gsapPromise;
      if (cancelled) return;

      const { gsap } = gsapMod;
      stInst = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const wrap  = wrapRef.current!;
      const proxy = { frame: 0 };

      /**
       * GSAP Timeline (scrubbed by ScrollTrigger):
       *
       *  ├── 0.00–0.12  Phase 1: bowl entrance
       *  │               opacity 0→1, y 50→0, scale 0.92→1 (expo.out)
       *  │
       *  └── 0.12–1.00  Phase 2: frame scrub
       *                  frame 0 → (N-1), bidirectional via scrub
       */
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        wrap,
        { opacity: 0, y: 50, scale: 0.92, transformOrigin: "center center" },
        { opacity: 1, y: 0,  scale: 1,    ease: "expo.out", duration: 0.12 },
        0
      );

      tl.to(
        proxy,
        {
          frame:    frameCount - 1,
          ease:     "none",
          duration: 0.88,
          onUpdate() {
            // Coalesce renders to one per animation frame via GSAP ticker
            if (!tickPendingRef.current) {
              tickPendingRef.current = true;
              gsap.ticker.add(function tick() {
                renderFrame(proxy.frame);
                tickPendingRef.current = false;
                gsap.ticker.remove(tick);
              });
            }
          },
        },
        0.12
      );

      ScrollTrigger.create({
        animation:           tl,
        trigger:             sectionRef.current,
        start:               "top top",
        end:                 () => `+=${scrollHeight}`,
        scrub:               2,     // 2 s momentum lag — cinematic feel
        pin:                 true,
        pinSpacing:          true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
      });

      // ── Mark ready NOW — overlay fades out immediately ──────────────────
      // Remaining frames 1–239 stream in the background via a detached async
      // function. renderFrame() silently skips frames not yet decoded, so
      // there is no visible artefact even if the user scrolls immediately.
      setPhase("ready");

      // Fire-and-forget: load the rest of the sequence in background batches.
      (async () => {
        for (let i = 1; i < frameCount; i += 20) {
          if (cancelled) return;
          await Promise.all(
            Array.from(
              { length: Math.min(20, frameCount - i) },
              (_, k) => loadOne(i + k)
            )
          );
        }
      })();
    }

    run().catch((e) => {
      console.error("[FrameSequenceCanvas]", e);
      setPhase("error");
    });

    return () => {
      cancelled = true;
      stInst?.getAll().forEach((st) => st.kill());
      ro?.disconnect();
      framesRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, frameBasePath, frameExtension, frameDigits, scrollHeight]);

  const isReady = phase === "ready";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={sectionRef}
      id="frame-sequence-section"
      style={{
        position:   "relative",
        width:      "100%",
        height:     "100vh",
        overflow:   "hidden",
        background: "transparent",
        zIndex:     10,
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          LOADING OVERLAY
          Uses CSS opacity transition so there is never an abrupt flash.
          pointerEvents:none once ready so the scroll works immediately.
      ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         20,
          background:     `${PAGE_BG}ee`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition:     "opacity 0.7s ease",
          opacity:         isReady ? 0 : 1,
          pointerEvents:   isReady ? "none" : "auto",
        }}
      >
        {phase === "error" ? (
          <p style={{
            color: "#aaa", fontFamily: "var(--font-sans)",
            fontSize: "0.78rem", letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Frames not found — check /public{frameBasePath}001.{frameExtension}
          </p>
        ) : (
          <>
            <p style={{
              color: "#222", fontFamily: "var(--font-sans)",
              fontSize: "0.62rem", fontWeight: 700,
              letterSpacing: "0.38em", textTransform: "uppercase",
              marginBottom: "1.8rem", opacity: 0.35,
            }}>Probae</p>

            {/* Three-dot pulse — visible only for the single-frame load */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: "5px", height: "5px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6A0FAD, #F97316)",
                  animation: `fsca-dot 1.1s ease-in-out ${i * 0.18}s infinite`,
                }} />
              ))}
            </div>
          </>

        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CANVAS WRAPPER
          Starts at opacity:0 — GSAP Phase 1 animates it in on first scroll.
          Full 100%×100% so the 16:9 frame fits with contain semantics.
      ════════════════════════════════════════════════════════════════════ */}
      <div
        ref={wrapRef}
        style={{
          opacity:    0,
          position:   "relative",
          width:      "100%",
          height:     "100%",
          willChange: "transform, opacity",
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label="Bowl ingredient explosion animation"
          role="img"
          style={{ display: "block", width: "100%", height: "100%" }}
        />

        {/* ── BLEND GRADIENTS ───────────────────────────────────────────────
            These 4 overlays dissolve the dark frame edges into the page.
            Colours match the surrounding sections exactly.                 */}

        {/* Top — fades into hero / page grid background */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "0 0 auto 0",
          height: "22%",
          background: `linear-gradient(to bottom, ${PAGE_BG} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 2,
        }} />

        {/* Bottom — fades into white menu section */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "auto 0 0 0",
          height: "28%",
          background: `linear-gradient(to top, ${SECTION_BG} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 2,
        }} />

        {/* Left edge */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "0 auto 0 0",
          width: "10%",
          background: `linear-gradient(to right, ${PAGE_BG} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 2,
        }} />

        {/* Right edge */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "0 0 0 auto",
          width: "10%",
          background: `linear-gradient(to left, ${PAGE_BG} 0%, transparent 100%)`,
          pointerEvents: "none", zIndex: 2,
        }} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAGLINE + SCROLL CARET
          Sits above the blend gradients (zIndex: 5).
          Fades in smoothly once GSAP is ready.
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:        "absolute",
        bottom:          "1.75rem",
        left:            0,
        right:           0,
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        gap:             "0.45rem",
        pointerEvents:   "none",
        zIndex:          5,
        transition:      "opacity 0.6s ease 0.2s",
        opacity:          isReady ? 1 : 0,
      }}>
        <p style={{
          color:         "rgba(34,34,34,0.4)",
          fontFamily:    "var(--font-sans)",
          fontSize:      "clamp(0.55rem, 1.5vw, 0.68rem)",
          fontWeight:    600,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>{overlayText}</p>

        {/* Pulsing scroll caret */}
        <div style={{
          width:      "1px",
          height:     "30px",
          background: "linear-gradient(to bottom, rgba(34,34,34,0.3), transparent)",
          animation:  "fsca-pulse 1.8s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes fsca-pulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1);    }
          50%       { opacity: 0.1; transform: scaleY(0.45); }
        }
        @keyframes fsca-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.1); opacity: 1;   }
        }
      `}</style>

    </div>
  );
}
