import { useState, useEffect, useCallback, useRef } from "react";
import type { Student } from "@/types/student";

const MODEL_URL = "/models";

// Lazy-load face-api.js to avoid top-level import issues
let faceapiModule: typeof import("face-api.js") | null = null;

async function getFaceApi() {
  if (!faceapiModule) {
    faceapiModule = await import("face-api.js");
  }
  return faceapiModule;
}

export interface UseFaceApiReturn {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  detectAllFaces: (
    input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ) => Promise<any[]>;
  createMatcher: (students: Student[]) => any | null;
  getFaceApiInstance: () => Promise<typeof import("face-api.js")>;
}

export function useFaceApi(): UseFaceApiReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadModels = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const faceapi = await getFaceApi();
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setLoadError(
          "Falha ao carregar modelos de reconhecimento facial. Verifique se os arquivos dos modelos estão em /public/models/"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const detectAllFaces = useCallback(
    async (input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement) => {
      if (!isLoaded) return [];
      const faceapi = await getFaceApi();
      const results = await faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
      return results;
    },
    [isLoaded]
  );

  const createMatcher = useCallback(
    (students: Student[]) => {
      if (!faceapiModule) return null;
      const faceapi = faceapiModule;
      const labeled = students
        .filter((s) => s.faceDescriptor)
        .map(
          (s) =>
            new faceapi.LabeledFaceDescriptors(s.id, [s.faceDescriptor!])
        );
      if (labeled.length === 0) return null;
      return new faceapi.FaceMatcher(labeled, 0.6);
    },
    []
  );

  return { isLoaded, isLoading, loadError, detectAllFaces, createMatcher, getFaceApiInstance: getFaceApi };
}
