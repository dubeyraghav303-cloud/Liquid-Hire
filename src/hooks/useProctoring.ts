"use client";

import { useEffect, useState } from "react";

type ProctorState = {
  isCheating: boolean;
  warningMessage: string;
};

type UseProctoringArgs = {
  videoElement: HTMLVideoElement | null;
};

export function useProctoring({ videoElement }: UseProctoringArgs): ProctorState {
  const [state, setState] = useState<ProctorState>({
    isCheating: false,
    warningMessage: "",
  });

  useEffect(() => {
    if (!videoElement) return;

    let cancelled = false;
    let detector: any;
    let intervalId: number | null = null;

    const setup = async () => {
      try {
        const visionModule = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, ObjectDetector } = visionModule as any;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          // In a real deployment, point this to the CDN or your own hosted wasm assets.
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        detector = await ObjectDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float16/1/efficientdet_lite2.tflite",
          },
          scoreThreshold: 0.5,
          runningMode: "VIDEO",
        });

        if (cancelled) return;

        intervalId = window.setInterval(() => {
          if (!videoElement || videoElement.readyState < 2) return;

          const result = detector.detectForVideo(videoElement, performance.now());
          const categories = result?.detections ?? [];

          let peopleCount = 0;
          let hasPhone = false;
          let hasBook = false;

          for (const det of categories) {
            const label =
              det.categories?.[0]?.categoryName?.toLowerCase() ??
              det.categoryName?.toLowerCase?.() ??
              "";

            if (label.includes("person")) peopleCount += 1;
            if (label.includes("cell phone") || label.includes("phone")) hasPhone = true;
            if (label.includes("book")) hasBook = true;
          }

          let warningMessage = "";
          if (peopleCount > 1) {
            warningMessage = "Multiple people detected";
          } else if (hasPhone) {
            warningMessage = "Prohibited object: Phone";
          } else if (hasBook) {
            warningMessage = "Prohibited object: Book";
          }

          setState({
            isCheating: Boolean(warningMessage),
            warningMessage,
          });
        }, 500);
      } catch (err) {
        console.error("Proctoring initialization failed", err);
      }
    };

    void setup();

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (detector?.close) {
        detector.close();
      }
    };
  }, [videoElement]);

  return state;
}

