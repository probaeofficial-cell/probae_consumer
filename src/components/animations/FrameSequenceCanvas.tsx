"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface FrameSequenceCanvasProps {
  /** Total number of frames in the sequence (e.g. 240 for frame_0001→frame_0240) */
  frameCount?: number;
  /** Base URL path for frames, e.g. "/frames/frame_" */
  frameBasePath?: string;
  /** File extension without leading dot, e.g. "jpg" */
  frameExtension?: string;
  /** Zero-padding width for frame numbers, e.g. 4 → "0001" */
  frameDigits?: number;
  /** Total pinned scroll distance, e.g. "300vh" */
  scrollHeight?: string;
  /** Optional text shown as an overlay label during the animation */
  overlayText?: string;
  /** Background colour of the canvas section */
  backgroundColor?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Returns a zero-padded frame URL, e.g. frame_0042.jpg */
function buildFrameUrl(
  basePath: string,
  index: number,
  digits: number,
  extension: string
): string {
  const padded = String(index).padStart(digits, "0");
  return `${basePath}${padded}.${extension}`;
}

/**
 * Draws one image onto the canvas using object-fit: cover semantics —
 * the image is scaled to fill the canvas and centred.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
): void {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasW / canvasH;

  let drawW: number;
  let drawH: number;

  if (imgRatio > canvasRatio) {
    // image is wider → fit height, crop sides
    drawH = canvasH;
    drawW = drawH * imgRatio;
  } else {
    // image is taller → fit width, crop top/bottom
    drawW = canvasW;
    drawH = drawW / imgRatio;
  }

  const offsetX = (canvasW - drawW) / 2;
  const offsetY = (canvasH - drawH) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function FrameSequenceCanvas({
  frameCount = 240,
  frameBasePath = "/frames/frame_",
  frameExtension = "jpg",
  frameDigits = 4,
  scrollHeight = "300vh",
  overlayText = "Every ingredient, precisely placed.",
  backgroundColor = "#0f0f0f",
}: FrameSequenceCanvasProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const renderScheduledRef = useRef<boolean>(false);

  const [loadProgress, setLoadProgress] = useState<number>(0); // 0–100
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

  // ── Canvas sizing (DPR-aware, object-fit: cover) ──────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    // Re-render the current frame after resize
    const img = framesRef.current[currentFrameRef.current];
    if (img?.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, w, h);
      drawCover(ctx, img, w, h);
    }
  }, []);

  // ── Frame renderer (called by GSAP ticker) ────────────────────────────────
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frames = framesRef.current;
    if (!frames.length) return;

    const clamped = Math.max(0, Math.min(frames.length - 1, Math.round(index)));
    currentFrameRef.current = clamped;
    const img = frames[clamped];
    if (!img?.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);
    drawCover(ctx, img, w, h);
  }, []);

  // ── Preload all frames, then boot GSAP ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let gsapInstance: typeof import("gsap").gsap | null = null;
    let scrollTriggerInstance: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let tickerFn: ((time: number, deltaTime: number) => void) | null = null;

    async function bootstrap() {
      // ── 1. Preload frames ──────────────────────────────────────────────
      const imageElements: HTMLImageElement[] = new Array(frameCount);
      let loaded = 0;

      const loadOne = (frameIndex: number): Promise<void> =>
        new Promise((resolve) => {
          const img = new Image();
          // Cross-origin not needed for /public served assets
          const src = buildFrameUrl(
            frameBasePath,
            frameIndex + 1, // frames are 1-indexed
            frameDigits,
            frameExtension
          );
          img.src = src;
          img.onload = () => {
            if (!cancelled) {
              loaded++;
              setLoadProgress(Math.round((loaded / frameCount) * 100));
            }
            resolve();
          };
          img.onerror = () => {
            // Still resolve so Promise.all doesn't abort the whole batch.
            // The frame will simply be skipped during render.
            if (!cancelled) {
              loaded++;
              setLoadProgress(Math.round((loaded / frameCount) * 100));
            }
            resolve();
          };
          imageElements[frameIndex] = img;
        });

      // Load in parallel batches of 20 to avoid saturating the browser's
      // connection pool while keeping total load time fast.
      const BATCH = 20;
      for (let i = 0; i < frameCount; i += BATCH) {
        if (cancelled) return;
        const batch = Array.from(
          { length: Math.min(BATCH, frameCount - i) },
          (_, k) => loadOne(i + k)
        );
        await Promise.all(batch);
      }

      if (cancelled) return;

      // Check that at least the first frame loaded properly
      if (
        !imageElements[0] ||
        !imageElements[0].complete ||
        imageElements[0].naturalWidth === 0
      ) {
        setLoadError(true);
        return;
      }

      framesRef.current = imageElements;

      // Draw first frame immediately
      resizeCanvas();
      renderFrame(0);
      setIsLoaded(true);

      // ── 2. ResizeObserver ──────────────────────────────────────────────
      resizeObserver = new ResizeObserver(() => {
        if (!cancelled) resizeCanvas();
      });
      if (canvasRef.current) {
        resizeObserver.observe(canvasRef.current);
      }

      // ── 3. Boot GSAP + ScrollTrigger ───────────────────────────────────
      const gsapMod = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled) return;

      gsapInstance = gsapMod.gsap;
      scrollTriggerInstance = ScrollTrigger;
      gsapInstance.registerPlugin(ScrollTrigger);

      // The proxy object GSAP will animate
      const proxy = { frame: 0 };

      gsapInstance.to(proxy, {
        frame: frameCount - 1,
        // No snap — allows sub-frame interpolation for silky motion
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${scrollHeight}`,
          // scrub: 2 → 2-second lag behind scroll position, giving a
          // cinematic, momentum-style feel instead of a mechanical scrub
          scrub: 2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => {
            // Schedule a render via GSAP ticker (never more than once per frame)
            if (!renderScheduledRef.current) {
              renderScheduledRef.current = true;
              gsapInstance!.ticker.add(function tick() {
                renderFrame(proxy.frame);
                renderScheduledRef.current = false;
                gsapInstance!.ticker.remove(tick);
              });
            }
          },
        },
      });
    }

    bootstrap().catch((err) => {
      console.error("[FrameSequenceCanvas] Bootstrap error:", err);
      setLoadError(true);
    });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelled = true;

      // Kill all ScrollTrigger instances created in this component scope
      if (scrollTriggerInstance) {
        scrollTriggerInstance.getAll().forEach((st) => st.kill());
      }

      // Remove any pending ticker callback
      if (tickerFn && gsapInstance) {
        gsapInstance.ticker.remove(tickerFn);
      }

      // Cancel any pending rAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Disconnect resize observer
      resizeObserver?.disconnect();

      // Release frame image refs to allow GC
      framesRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, frameBasePath, frameExtension, frameDigits, scrollHeight]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={sectionRef}
      id="frame-sequence-section"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor,
        // Sit above the white menu section so the pinned layer covers it
        // cleanly during the scroll; the gradient below provides a soft
        // visual handoff instead of a hard black edge.
        zIndex: 10,
      }}
    >
      {/* Canvas — fills the full section */}
      <canvas
        ref={canvasRef}
        aria-label="Bowl ingredient animation"
        role="img"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          willChange: "transform", // GPU compositing hint
        }}
      />

      {/* ── Bottom blend gradient ────────────────────────────────────────
           Fades the dark canvas frame into the white section below,
           preventing a hard cut when the pin releases. The gradient is
           white at the very bottom so it dissolves into the menu section
           background seamlessly. Height covers the bottom ~28% of the
           viewport so it is subtle but effective.                       */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(15,15,15,0.55) 50%, #ffffff 100%)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* ── Loading overlay ─────────────────────────────────────────────── */}
      <div
        aria-hidden={isLoaded}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          transition: "opacity 0.6s ease",
          opacity: isLoaded ? 0 : 1,
          pointerEvents: isLoaded ? "none" : "auto",
          zIndex: 10,
        }}
      >
        {loadError ? (
          // Fallback if frames are missing / unreachable
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p
              style={{
                color: "#888",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Frame sequence unavailable.
            </p>
            <p
              style={{
                color: "#555",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              Place frames at{" "}
              <code>
                /public{frameBasePath}
                {"<number>"}
                .{frameExtension}
              </code>
            </p>
          </div>
        ) : (
          <>
            {/* Wordmark / loader label */}
            <p
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.625rem, 2vw, 0.75rem)",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: "2.5rem",
                opacity: 0.5,
              }}
            >
              Probae
            </p>

            {/* Progress bar track */}
            <div
              style={{
                width: "clamp(120px, 30vw, 280px)",
                height: "2px",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              {/* Progress bar fill */}
              <div
                style={{
                  height: "100%",
                  width: `${loadProgress}%`,
                  background:
                    "linear-gradient(90deg, #6A0FAD, #F97316)",
                  borderRadius: "999px",
                  transition: "width 0.15s ease-out",
                }}
              />
            </div>

            {/* Percentage label */}
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.6875rem",
                letterSpacing: "0.15em",
                marginTop: "1rem",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {loadProgress}%
            </p>
          </>
        )}
      </div>

      {/* ── Scroll hint (visible once loaded, fades as user scrolls) ─────── */}
      {isLoaded && (
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            pointerEvents: "none",
            zIndex: 5,
            animation: "fsca-fade-in 0.8s ease 0.3s both",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.625rem, 2vw, 0.75rem)",
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            {overlayText}
          </p>
          {/* Animated scroll caret */}
          <div
            style={{
              width: "1px",
              height: "40px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
              animation: "fsca-pulse 1.8s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* ── Local keyframes injected once ───────────────────────────────── */}
      <style>{`
        @keyframes fsca-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fsca-pulse {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50%       { opacity: 0.2; transform: scaleY(0.6); }
        }
      `}</style>
    </div>
  );
}
