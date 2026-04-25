import { useEffect, useRef } from "react";

/**
 * Real-time face detection + overlay drawing.
 * Uses MediaPipe FaceLandmarker to track the user's head position
 * and draws the selected overlay image on an overlay canvas.
 *
 * Supports two modes:
 * - "hair": positions overlay above the forehead (wigs, braids, etc.)
 * - "makeup": positions overlay on the face itself (glam, bridal, etc.)
 *
 * Includes a 5-second scanning phase before showing the overlay.
 * Applies a subtle skin-smoothing effect instead of color alteration.
 * All state is ref-based to avoid React re-render storms from rAF.
 */
export function useFaceOverlay({
  videoRef,
  overlayCanvasRef,
  active,
  hairImageSrc,
  onScanUpdate,
  mode = "hair",
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  active: boolean;
  hairImageSrc: string;
  onScanUpdate?: (info: { progress: number; complete: boolean; faceDetected: boolean }) => void;
  mode?: "hair" | "makeup";
}) {
  const landmarkerRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const hairImgRef = useRef<HTMLImageElement | null>(null);
  const initStartedRef = useRef(false);
  const readyRef = useRef(false);
  const scanStartRef = useRef<number | null>(null);
  const lastCallbackRef = useRef(0);

  const scanProgressRef = useRef(0);
  const scanCompleteRef = useRef(false);
  const faceDetectedRef = useRef(false);

  const SCAN_DURATION = 5000;

  // Reset scan on deactivation
  useEffect(() => {
    if (!active) {
      scanStartRef.current = null;
    }
  }, [active]);

  // Load the selected overlay image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = hairImageSrc;
    img.onload = () => {
      hairImgRef.current = img;
    };
    return () => {
      hairImgRef.current = null;
    };
  }, [hairImageSrc]);

  // Initialize MediaPipe FaceLandmarker (once)
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/wasm"
        );
        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        readyRef.current = true;
      } catch (e) {
        console.error("Failed to init face detection:", e);
      }
    })();
  }, []);

  // Detection + drawing loop
  useEffect(() => {
    if (!active) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      const ctx = overlayCanvasRef.current?.getContext("2d");
      if (ctx && overlayCanvasRef.current) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
      return;
    }

    let lastTimestamp = -1;

    const loop = () => {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!landmarkerRef.current || !readyRef.current) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      if (now <= lastTimestamp) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTimestamp = now;

      try {
        const results = landmarkerRef.current.detectForVideo(video, now);
        const hasFace = results.faceLandmarks?.length > 0;

        if (hasFace) {
          if (scanStartRef.current === null) {
            scanStartRef.current = now;
          }

          const elapsed = now - scanStartRef.current;
          const progress = Math.min((elapsed / SCAN_DURATION) * 100, 100);
          const complete = elapsed >= SCAN_DURATION;

          scanProgressRef.current = progress;
          scanCompleteRef.current = complete;
          faceDetectedRef.current = true;

          if (onScanUpdate && now - lastCallbackRef.current > 100) {
            lastCallbackRef.current = now;
            onScanUpdate({ progress, complete, faceDetected: true });
          }

          const lm = results.faceLandmarks[0];
          const w = canvas.width;
          const h = canvas.height;

          // Always show face mesh during scanning, then keep skin smoothing after.
          if (!complete) {
            drawScanningPhase(ctx, lm, w, h, progress);
          } else {
            const foreheadTop = lm[10];
            const leftTemple = lm[234];
            const rightTemple = lm[454];
            const chin = lm[152];

            const faceWidth = Math.abs(rightTemple.x - leftTemple.x) * w;
            const faceHeight = Math.abs(chin.y - foreheadTop.y) * h;
            const faceCenterX = ((leftTemple.x + rightTemple.x) / 2) * w;
            const faceCenterY = ((foreheadTop.y + chin.y) / 2) * h;

            // Subtle skin smoothing — soft transparent overlay on face region only
            drawSkinSmoothing(ctx, faceCenterX, faceCenterY, faceWidth, faceHeight);

            // Makeup overlays still apply on the face after scan completes.
            if (hairImgRef.current && mode === "makeup") {
              const angle = Math.atan2(
                (lm[454].y - lm[234].y) * h,
                (lm[454].x - lm[234].x) * w
              );
              drawMakeupOverlay(ctx, hairImgRef.current, lm, w, h, faceCenterX, faceCenterY, faceWidth, faceHeight, angle);
            }
          }

          // Hair mode: always show the wig as a small forward-facing preview in the corner —
          // never overlaid on the user's head.
          if (hairImgRef.current && mode === "hair") {
            drawCornerPreview(ctx, hairImgRef.current, w, h);
          }

        } else {
          scanStartRef.current = null;
          scanProgressRef.current = 0;
          scanCompleteRef.current = false;
          faceDetectedRef.current = false;

          if (onScanUpdate && now - lastCallbackRef.current > 100) {
            lastCallbackRef.current = now;
            onScanUpdate({ progress: 0, complete: false, faceDetected: false });
          }
        }
      } catch {
        // Ignore detection errors
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, videoRef, overlayCanvasRef, onScanUpdate, mode]);

  return {
    scanProgress: scanProgressRef.current,
    scanComplete: scanCompleteRef.current,
    faceDetected: faceDetectedRef.current,
  };
}

/** Draw scanning dots and progress ring */
function drawScanningPhase(
  ctx: CanvasRenderingContext2D,
  lm: any[],
  w: number,
  h: number,
  progress: number
) {
  const dotLandmarks = [
    10, 234, 454, 152, 1, 33, 263, 61, 291, 199,
    67, 297, 70, 300, 107, 336, 69, 299, 104, 333,
    103, 332, 54, 284, 21, 251, 162, 389, 127, 356,
  ];
  const scanAlpha = 0.3 + (progress / 100) * 0.7;

  for (const idx of dotLandmarks) {
    if (lm[idx]) {
      ctx.beginPath();
      ctx.arc(lm[idx].x * w, lm[idx].y * h, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 100, 255, ${scanAlpha})`;
      ctx.fill();
    }
  }

  const connections = [
    [10, 67], [67, 69], [69, 104], [104, 54], [54, 21], [21, 162], [162, 127],
    [10, 297], [297, 299], [299, 333], [333, 284], [284, 251], [251, 389], [389, 356],
    [33, 133], [263, 362], [61, 291],
  ];
  ctx.strokeStyle = `rgba(200, 100, 255, ${scanAlpha * 0.5})`;
  ctx.lineWidth = 1;
  for (const [a, b] of connections) {
    if (lm[a] && lm[b]) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * w, lm[a].y * h);
      ctx.lineTo(lm[b].x * w, lm[b].y * h);
      ctx.stroke();
    }
  }

  // Progress ring around face
  const faceCX = ((lm[234].x + lm[454].x) / 2) * w;
  const faceCY = ((lm[10].y + lm[152].y) / 2) * h;
  const faceRadius = Math.abs(lm[454].x - lm[234].x) * w * 0.9;
  ctx.beginPath();
  ctx.arc(faceCX, faceCY, faceRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress / 100));
  ctx.strokeStyle = "rgba(200, 100, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/** Subtle skin smoothing — soft, semi-transparent radial glow (no color shift) */
function drawSkinSmoothing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  faceW: number,
  faceH: number
) {
  const radius = Math.max(faceW, faceH) * 0.8;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  glow.addColorStop(0.5, "rgba(255, 255, 255, 0.03)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

/** Draw hair overlay sitting ON the head, then cut the face area out so only hair remains */
function drawHairOverlay(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  faceCenterX: number,
  foreheadY: number,
  faceWidth: number,
  faceHeight: number,
  angle: number
) {
  // Size hair relative to the face — wide enough to frame the head from above
  const hairWidth = faceWidth * 1.85;
  const hairHeight = hairWidth * (img.height / img.width || 1.2);

  // Anchor the wig so its bottom edge lands at the user's hairline (forehead top),
  // making the hair appear to grow OUT of the head rather than covering the face.
  // Small downward nudge lets the hairline blend slightly onto the forehead.
  const hairX = faceCenterX - hairWidth / 2;
  const hairlineBlend = faceHeight * 0.08;
  const hairY = foreheadY - hairHeight + hairlineBlend;

  ctx.save();
  // Rotate around the forehead point so the wig tilts with the head
  ctx.translate(faceCenterX, foreheadY);
  ctx.rotate(angle);
  ctx.translate(-faceCenterX, -foreheadY);
  ctx.globalAlpha = 0.97;
  ctx.drawImage(img, hairX, hairY, hairWidth, hairHeight);

  // Erase EVERYTHING from the forehead downward so no wig pixels (mannequin face,
  // long hair strands, etc.) cover the user's face. Hair only remains above the head.
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillRect(
    faceCenterX - hairWidth,
    foreheadY + hairlineBlend,
    hairWidth * 2,
    hairHeight + faceHeight * 2
  );
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

/**
 * MediaPipe face oval landmark indices — the outline of the face.
 * Used to clip the makeup overlay to the user's actual face shape.
 */
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

/** Draw makeup like a filter — clipped to the user's actual face contour */
function drawMakeupOverlay(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lm: any[],
  canvasW: number,
  canvasH: number,
  faceCenterX: number,
  faceCenterY: number,
  faceWidth: number,
  faceHeight: number,
  angle: number
) {
  // Scale the makeup overlay to fully cover the face contour
  const overlayWidth = faceWidth * 1.3;
  const overlayHeight = faceHeight * 1.25;
  const overlayX = faceCenterX - overlayWidth / 2;
  const overlayY = faceCenterY - overlayHeight / 2;

  ctx.save();

  // Build a clip path that follows the face oval landmarks so the makeup
  // conforms to the user's face like a filter (not a flat rectangle).
  ctx.beginPath();
  for (let i = 0; i < FACE_OVAL_INDICES.length; i++) {
    const p = lm[FACE_OVAL_INDICES[i]];
    if (!p) continue;
    const px = p.x * canvasW;
    const py = p.y * canvasH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.clip();

  // Rotate around face center so makeup follows head tilt
  ctx.translate(faceCenterX, faceCenterY);
  ctx.rotate(angle);
  ctx.translate(-faceCenterX, -faceCenterY);

  // Blend ONLY the makeup color/tone onto the user's skin — keep their facial
  // features (eyes, nose, mouth, lighting) intact so it looks like makeup, not
  // a different face pasted on top.
  ctx.globalAlpha = 0.45;
  ctx.globalCompositeOperation = "color";
  ctx.drawImage(img, overlayX, overlayY, overlayWidth, overlayHeight);

  // A second very subtle pass adds a touch of warmth/glow without showing features.
  ctx.globalAlpha = 0.18;
  ctx.globalCompositeOperation = "soft-light";
  ctx.drawImage(img, overlayX, overlayY, overlayWidth, overlayHeight);

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

/** Draw a small wig preview thumbnail in the lower-right corner during scanning */
function drawCornerPreview(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const aspect = img.height / img.width || 1.2;
  const previewW = Math.min(canvasW, canvasH) * 0.22;
  const previewH = previewW * aspect;
  const marginX = canvasW * 0.03;
  // Lift the preview well above the bottom edge so on-screen UI controls
  // never cover the wig — keep the full image visible inside the magenta box.
  const marginBottom = canvasH * 0.18;
  const x = canvasW - previewW - marginX;
  const y = canvasH - previewH - marginBottom;

  ctx.save();
  // Rounded card background for contrast
  const radius = 12;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + previewW - radius, y);
  ctx.quadraticCurveTo(x + previewW, y, x + previewW, y + radius);
  ctx.lineTo(x + previewW, y + previewH - radius);
  ctx.quadraticCurveTo(x + previewW, y + previewH, x + previewW - radius, y + previewH);
  ctx.lineTo(x + radius, y + previewH);
  ctx.quadraticCurveTo(x, y + previewH, x, y + previewH - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 100, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.clip();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(img, x, y, previewW, previewH);
  ctx.restore();
}
