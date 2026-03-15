import { useEffect, useRef } from "react";

/**
 * Real-time face detection + hair overlay drawing.
 * Uses MediaPipe FaceLandmarker to track the user's head position
 * and draws the selected hair image on an overlay canvas.
 */
export function useFaceOverlay({
  videoRef,
  overlayCanvasRef,
  active,
  hairImageSrc,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  active: boolean;
  hairImageSrc: string;
}) {
  const landmarkerRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const hairImgRef = useRef<HTMLImageElement | null>(null);
  const initStartedRef = useRef(false);
  const readyRef = useRef(false);

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
        console.log("FaceLandmarker ready");
      } catch (e) {
        console.error("Failed to init face detection:", e);
      }
    })();
  }, []);

  // Detection + drawing loop
  useEffect(() => {
    if (!active) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      // Clear overlay
      const ctx = overlayCanvasRef.current?.getContext("2d");
      if (ctx && overlayCanvasRef.current) {
        ctx.clearRect(
          0,
          0,
          overlayCanvasRef.current.width,
          overlayCanvasRef.current.height
        );
      }
      return;
    }

    let lastTimestamp = -1;

    const loop = () => {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      const landmarker = landmarkerRef.current;
      const hairImg = hairImgRef.current;

      if (!video || !canvas || video.readyState < 2) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      // Match canvas size to video
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If MediaPipe isn't ready yet, just continue looping
      if (!landmarker || !readyRef.current) {
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
        const results = landmarker.detectForVideo(video, now);

        if (results.faceLandmarks?.length > 0 && hairImg) {
          const lm = results.faceLandmarks[0];
          const w = canvas.width;
          const h = canvas.height;

          // Key face landmarks (normalised 0-1)
          const foreheadTop = lm[10]; // very top of forehead
          const leftTemple = lm[234]; // left side of face
          const rightTemple = lm[454]; // right side of face
          const chin = lm[152]; // bottom of chin
          const leftCheek = lm[234];
          const rightCheek = lm[454];
          const noseTip = lm[1];

          // Calculate face measurements in pixels
          const faceWidth = Math.abs(rightTemple.x - leftTemple.x) * w;
          const faceHeight = Math.abs(chin.y - foreheadTop.y) * h;
          const faceCenterX = ((leftTemple.x + rightTemple.x) / 2) * w;
          const foreheadY = foreheadTop.y * h;

          // Calculate face angle for rotation
          const leftEar = lm[234];
          const rightEar = lm[454];
          const angle = Math.atan2(
            (rightEar.y - leftEar.y) * h,
            (rightEar.x - leftEar.x) * w
          );

          // Hair overlay sizing — wider and taller than the face
          // so it looks like it naturally covers/surrounds the head
          const hairWidth = faceWidth * 2.8;
          const hairHeight = faceHeight * 2.5;

          // Position: centered on face, extending above forehead
          const hairX = faceCenterX - hairWidth / 2;
          const hairY = foreheadY - hairHeight * 0.55;

          ctx.save();
          // Rotate around face center for natural head tilt tracking
          ctx.translate(faceCenterX, foreheadY);
          ctx.rotate(angle);
          ctx.translate(-faceCenterX, -foreheadY);

          ctx.globalAlpha = 0.88;
          ctx.drawImage(hairImg, hairX, hairY, hairWidth, hairHeight);
          ctx.restore();
        }
      } catch {
        // Ignore detection errors, keep looping
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, videoRef, overlayCanvasRef]);
}
