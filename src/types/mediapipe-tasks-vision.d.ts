declare module "@mediapipe/tasks-vision" {
  export interface NormalizedLandmark {
    x: number;
    y: number;
    z?: number;
  }

  export interface FaceLandmarkerResult {
    faceLandmarks?: NormalizedLandmark[][];
  }

  export interface FaceLandmarkerOptions {
    baseOptions: {
      modelAssetPath: string;
      delegate?: "GPU" | "CPU";
    };
    runningMode?: "VIDEO" | "IMAGE";
    numFaces?: number;
  }

  export class FilesetResolver {
    static forVisionTasks(basePath: string): Promise<unknown>;
  }

  export class FaceLandmarker {
    static createFromOptions(
      vision: unknown,
      options: FaceLandmarkerOptions,
    ): Promise<FaceLandmarker>;

    detectForVideo(video: HTMLVideoElement, timestampMs: number): FaceLandmarkerResult;
    close?(): void;
  }
}
