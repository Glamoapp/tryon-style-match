import { useEffect, useRef, useCallback } from "react";

/**
 * Real-time face detection + hair overlay drawing.
 * Uses MediaPipe FaceLandmarker to track the user's head position
 * and draws the selected hair image on an overlay canvas.
 *
 * Includes a 5-second scanning phase before showing the overlay.
 * All state is ref-based to avoid React re-render storms from rAF.
 */
export function useFaceOverlay({
  videoRef,
  overlayCanvasRef,
  active,
  hairImageSrc,
  onScanUpdate,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  active: boolean;
  hairImageSrc: string;
  onScanUpdate?: (info: { progress: number; complete: boolean; faceDetected: boolean }) => void;
}) {
  const landmarkerRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const hairImgRef = useRef<HTMLImageElement | null>(null);
  const initStartedRef = useRef(false);
  const readyRef = useRef(false);
  const scanStartRef = useRef<number | null>(null);
  const lastCallbackRef = useRef(0);

  const SCAN_DURATION = 5000;

  // Reset scan on deactivation
  useEffect(() => {
    if (!active) {
      scanStartRef.current = null;
    }
  }, [active]);

  // Load the selected hair image
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
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
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

  // Detection + drawing loop — NO useState, all refs
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

          // Throttle callback to ~10fps to avoid React churn
          if (onScanUpdate && now - lastCallbackRef.current > 100) {
            lastCallbackRef.current = now;
            onScanUpdate({ progress, complete, faceDetected: true });
          }

          const lm = results.faceLandmarks[0];
          const w = canvas.width;
          const h = canvas.height;

          // During scanning phase: draw face mesh dots + progress ring
          if (!complete) {
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

          // After scan: draw hair overlay
          if (complete && hairImgRef.current) {
            const foreheadTop = lm[10];
            const leftTemple = lm[234];
            const rightTemple = lm[454];
            const chin = lm[152];

            const faceWidth = Math.abs(rightTemple.x - leftTemple.x) * w;
            const faceHeight = Math.abs(chin.y - foreheadTop.y) * h;
            const faceCenterX = ((leftTemple.x + rightTemple.x) / 2) * w;
            const foreheadY = foreheadTop.y * h;

            const angle = Math.atan2(
              (lm[454].y - lm[234].y) * h,
              (lm[454].x - lm[234].x) * w
            );

            const hairWidth = faceWidth * 2.8;
            const hairHeight = faceHeight * 2.5;
            const hairX = faceCenterX - hairWidth / 2;
            const hairY = foreheadY - hairHeight * 0.55;

            ctx.save();
            ctx.translate(faceCenterX, foreheadY);
            ctx.rotate(angle);
            ctx.translate(-faceCenterX, -foreheadY);
            ctx.globalAlpha = 0.88;
            ctx.drawImage(hairImgRef.current, hairX, hairY, hairWidth, hairHeight);
            ctx.restore();
          }
        } else {
          // No face — reset scan
          scanStartRef.current = null;
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
  }, [active, videoRef, overlayCanvasRef, onScanUpdate]);
}
