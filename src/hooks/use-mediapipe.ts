import { useState, useEffect, useCallback, useRef } from "react";
import type { Student } from "@/types/student";

// WASM servido localmente (copiado de node_modules para public/)
const WASM_URL = "/mediapipe-wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Threshold de distância cosseno para considerar "desconhecido"
const UNKNOWN_THRESHOLD = 0.25;

// ── Qualidade mínima para cadastro ──
/** Fração mínima do frame que o rosto deve ocupar (largura ou altura) */
const MIN_FACE_SIZE = 0.15;
/** Rosto deve estar dentro desta margem do centro (0.5 ± margem) */
const CENTER_MARGIN = 0.35;
/** Variância de Laplaciano mínima para considerar imagem nítida */
const MIN_SHARPNESS = 15;

/**
 * 68 índices de landmarks chave do modelo MediaPipe Face Mesh (478 pontos).
 * Escolhidos para cobrir as principais regiões do rosto de forma discriminativa.
 * Total: 68 * 3 floats = 204 valores por descriptor.
 */
const KEY_LANDMARKS = [
  // Contorno do rosto (17)
  234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379,
  365, 397,
  // Sobrancelha direita (5)
  70, 63, 105, 66, 107,
  // Sobrancelha esquerda (5)
  336, 296, 334, 293, 300,
  // Nariz — ponte (4)
  168, 6, 197, 195,
  // Nariz — base e narinas (5)
  94, 2, 5, 4, 19,
  // Olho direito (6)
  33, 161, 160, 159, 158, 157,
  // Olho esquerdo (6)
  263, 388, 387, 386, 385, 384,
  // Boca externa (12)
  0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84,
  // Boca interna (8)
  78, 95, 88, 178, 87, 14, 317, 402,
] as const; // 17+5+5+4+5+6+6+12+8 = 68 landmarks

export interface FaceDetectionResult {
  /** Bounding box normalizado (0-1) relativo ao frame do vídeo */
  box: { x: number; y: number; width: number; height: number };
  descriptor: Float32Array;
}

export interface MediaPipeMatcher {
  findBestMatch(descriptor: Float32Array): { label: string; distance: number };
}

// Instância singleton do FaceLandmarker
let faceLandmarkerInstance: import("@mediapipe/tasks-vision").FaceLandmarker | null = null;

// Timestamp monotônico para o MediaPipe VIDEO mode
let lastVideoTimestamp = -1;
function nextTimestamp(): number {
  const now = performance.now();
  if (now <= lastVideoTimestamp) {
    lastVideoTimestamp += 1;
  } else {
    lastVideoTimestamp = now;
  }
  return lastVideoTimestamp;
}

/** Gera um descriptor normalizado (vetor unitário) a partir dos landmarks de um rosto. */
function buildDescriptor(
  landmarks: { x: number; y: number; z: number }[]
): Float32Array {
  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const lm of landmarks) {
    if (lm.x < minX) minX = lm.x;
    if (lm.y < minY) minY = lm.y;
    if (lm.x > maxX) maxX = lm.x;
    if (lm.y > maxY) maxY = lm.y;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = Math.max(maxX - minX, maxY - minY) || 1;

  const desc = new Float32Array(KEY_LANDMARKS.length * 3);
  KEY_LANDMARKS.forEach((idx, i) => {
    const lm = landmarks[idx] ?? { x: 0, y: 0, z: 0 };
    desc[i * 3] = (lm.x - cx) / scale;
    desc[i * 3 + 1] = (lm.y - cy) / scale;
    desc[i * 3 + 2] = lm.z / scale;
  });

  // Normaliza para vetor unitário (necessário para distância cosseno via produto escalar)
  let norm = 0;
  for (let i = 0; i < desc.length; i++) norm += desc[i] * desc[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < desc.length; i++) desc[i] /= norm;

  return desc;
}

/** Distância cosseno entre dois descritores unitários: 0 = idênticos, 2 = opostos. */
function cosineDistance(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return 1 - dot; // 0 = perfeito, ~0.25+ = desconhecido
}

export interface UseMediaPipeReturn {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  detectFaces: (video: HTMLVideoElement) => Promise<FaceDetectionResult[]>;
  createMatcher: (students: Student[]) => MediaPipeMatcher | null;
  captureDescriptor: (
    video: HTMLVideoElement
  ) => Promise<{ descriptor: Float32Array; imageBase64: string }>;
  captureDescriptorFromFile: (
    file: File
  ) => Promise<{ descriptor: Float32Array; imageBase64: string }>;
}

export function useMediaPipe(): UseMediaPipeReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numFaces: 10,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          }
        );
        setIsLoaded(true);
      } catch (err) {
        console.error("Falha ao carregar MediaPipe:", err);
        setLoadError(
          "Falha ao carregar modelos de IA. Verifique sua conexão com a internet."
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const detectFaces = useCallback(
    async (video: HTMLVideoElement): Promise<FaceDetectionResult[]> => {
      if (!faceLandmarkerInstance || !isLoaded) return [];
      if (video.readyState < 2) return [];

      const result = faceLandmarkerInstance.detectForVideo(
        video,
        nextTimestamp()
      );

      if (!result.faceLandmarks || result.faceLandmarks.length === 0)
        return [];

      return result.faceLandmarks.map((landmarks) => {
        // Bounding box normalizado (0-1)
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const lm of landmarks) {
          if (lm.x < minX) minX = lm.x;
          if (lm.y < minY) minY = lm.y;
          if (lm.x > maxX) maxX = lm.x;
          if (lm.y > maxY) maxY = lm.y;
        }

        return {
          box: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          },
          descriptor: buildDescriptor(landmarks),
        };
      });
    },
    [isLoaded]
  );

  const createMatcher = useCallback(
    (students: Student[]): MediaPipeMatcher | null => {
      const EXPECTED_DESC_SIZE = KEY_LANDMARKS.length * 3; // 204

      const labeled = students
        .filter(
          (s) =>
            s.faceDescriptor &&
            s.faceDescriptor.length === EXPECTED_DESC_SIZE
        )
        .map((s) => ({ id: s.id, descriptor: s.faceDescriptor! }));

      if (labeled.length === 0) return null;

      return {
        findBestMatch(descriptor: Float32Array) {
          let bestLabel = "unknown";
          let bestDistance = Infinity;

          for (const { id, descriptor: ref } of labeled) {
            const dist = cosineDistance(descriptor, ref);
            if (dist < bestDistance) {
              bestDistance = dist;
              bestLabel = id;
            }
          }

          if (bestDistance > UNKNOWN_THRESHOLD) bestLabel = "unknown";
          return { label: bestLabel, distance: bestDistance };
        },
      };
    },
    []
  );

  /** Para captura de foto (WebcamCapture): detecta exatamente 1 rosto e extrai o descriptor. */
  const captureDescriptor = useCallback(
    async (
      video: HTMLVideoElement
    ): Promise<{ descriptor: Float32Array; imageBase64: string }> => {
      const results = await detectFaces(video);

      if (results.length === 0) throw new Error("NO_FACE");
      if (results.length > 1) throw new Error("MULTIPLE_FACES");

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

      return { descriptor: results[0].descriptor, imageBase64 };
    },
    [detectFaces]
  );

  /** Para upload de arquivo: lê a imagem, extrai descriptor via MediaPipe (IMAGE mode) e retorna base64. */
  const captureDescriptorFromFile = useCallback(
    async (file: File): Promise<{ descriptor: Float32Array; imageBase64: string }> => {
      if (!faceLandmarkerInstance || !isLoaded) throw new Error("NOT_LOADED");

      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageBase64;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // Imagem estática requer runningMode IMAGE; restaura VIDEO ao final.
      await faceLandmarkerInstance.setOptions({ runningMode: "IMAGE" });
      let result;
      try {
        result = faceLandmarkerInstance.detect(canvas);
      } finally {
        await faceLandmarkerInstance.setOptions({ runningMode: "VIDEO" });
      }

      if (!result.faceLandmarks || result.faceLandmarks.length === 0)
        throw new Error("NO_FACE");
      if (result.faceLandmarks.length > 1) throw new Error("MULTIPLE_FACES");

      return { descriptor: buildDescriptor(result.faceLandmarks[0]), imageBase64 };
    },
    [isLoaded]
  );

  return { isLoaded, isLoading, loadError, detectFaces, createMatcher, captureDescriptor, captureDescriptorFromFile };
}
