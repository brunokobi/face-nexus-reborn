import { useState, useEffect, useCallback, useRef } from "react";
import * as faceapi from "face-api.js";
import type { Student } from "@/types/student";

const MODEL_URL = "/models";

export interface UseFaceApiReturn {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  detectFace: (
    input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ) => Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null>;
  detectAllFaces: (
    input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ) => Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>[]>;
  createMatcher: (students: Student[]) => faceapi.FaceMatcher | null;
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

  const detectFace = useCallback(
    async (input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement) => {
      if (!isLoaded) return null;
      const result = await faceapi
        .detectSingleFace(input)
        .withFaceLandmarks()
        .withFaceDescriptor();
      return result || null;
    },
    [isLoaded]
  );

  const detectAllFaces = useCallback(
    async (input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement) => {
      if (!isLoaded) return [];
      const results = await faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
      return results;
    },
    [isLoaded]
  );

  const createMatcher = useCallback(
    (students: Student[]): faceapi.FaceMatcher | null => {
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

  return { isLoaded, isLoading, loadError, detectFace, detectAllFaces, createMatcher };
}
