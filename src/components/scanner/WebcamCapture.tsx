import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useFaceApi } from "@/hooks/use-face-api";

interface WebcamCaptureProps {
  onCapture: (imageBase64: string, descriptor: Float32Array) => void;
  onError?: (message: string) => void;
}

export function WebcamCapture({ onCapture, onError }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startCamera, stopCamera } = useCamera();
  const { isLoaded, isLoading, loadError, detectFace, detectAllFaces } = useFaceApi();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    if (!videoRef.current) return;
    setError(null);
    const ok = await startCamera(videoRef.current);
    if (!ok) {
      const msg = "Não foi possível acessar a câmera. Verifique as permissões do navegador.";
      setError(msg);
      onError?.(msg);
      return;
    }
    setCameraActive(true);
    setCapturedImage(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setProcessing(true);
    setError(null);

    try {
      // Check for multiple faces
      const allFaces = await detectAllFaces(videoRef.current);
      if (allFaces.length === 0) {
        setError("Nenhum rosto detectado. Posicione-se melhor em frente à câmera.");
        setProcessing(false);
        return;
      }
      if (allFaces.length > 1) {
        setError("Mais de um rosto detectado. Apenas uma pessoa deve estar em frente à câmera.");
        setProcessing(false);
        return;
      }

      const detection = allFaces[0];
      const descriptor = detection.descriptor;

      // Capture image to canvas
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

      stopCamera();
      setCameraActive(false);
      setCapturedImage(imageBase64);
      onCapture(imageBase64, descriptor);
    } catch (err) {
      console.error("Face detection error:", err);
      setError("Erro ao processar rosto. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
    handleStartCamera();
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-destructive/10 rounded-lg text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando modelos de IA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 gap-2">
                <Camera className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Câmera desativada</p>
              </div>
            )}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-48 border-2 border-primary/50 rounded-xl" />
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {capturedImage ? (
          <Button variant="outline" onClick={handleRetake} size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Tirar Novamente
          </Button>
        ) : cameraActive ? (
          <Button
            variant="hero"
            onClick={handleCapture}
            disabled={processing || !isLoaded}
            size="sm"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-1" />
                Capturar Foto
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleStartCamera} disabled={!isLoaded} size="sm">
            <Camera className="h-4 w-4 mr-1" />
            Abrir Câmera
          </Button>
        )}
      </div>
    </div>
  );
}
