import { useRef, useCallback } from "react";

export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(
    async (videoElement: HTMLVideoElement, facingMode: "user" | "environment" = "user") => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode },
        });
        streamRef.current = stream;
        videoElement.srcObject = stream;
        await videoElement.play();
        return true;
      } catch (err) {
        console.error("Camera access error:", err);
        return false;
      }
    },
    []
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  return { startCamera, stopCamera };
}
