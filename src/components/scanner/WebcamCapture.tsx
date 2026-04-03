import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Loader2, AlertCircle, Upload } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useMediaPipe } from "@/hooks/use-mediapipe";

interface WebcamCaptureProps {
  onCapture: (imageBase64: string, descriptor: Float32Array) => void;
  onError?: (message: string) => void;
}

export function WebcamCapture({ onCapture, onError }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startCamera, stopCamera } = useCamera();
  const { isLoaded, isLoading, loadError, captureDescriptor, captureDescriptorFromFile } = useMediaPipe();
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
    if (!videoRef.current) return;
    setProcessing(true);
    setError(null);

    try {
      const result = await captureDescriptor(videoRef.current);
      stopCamera();
      setCameraActive(false);
      setCapturedImage(result.imageBase64);
      onCapture(result.imageBase64, result.descriptor);
    } catch (err: any) {
      const msg = err?.message;
      if (msg === "NO_FACE") {
        setError("Nenhum rosto detectado. Posicione-se melhor em frente à câmera.");
      } else if (msg === "MULTIPLE_FACES") {
        setError("Mais de um rosto detectado. Apenas uma pessoa deve estar em frente à câmera.");
      } else if (msg === "FACE_TOO_SMALL") {
        setError("Rosto muito pequeno. Aproxime-se mais da câmera.");
      } else if (msg === "FACE_NOT_CENTERED") {
        setError("Rosto descentralizado. Posicione o rosto no centro da câmera.");
      } else if (msg === "FACE_BLURRY") {
        setError("Imagem borrada. Mantenha-se parado e garanta boa iluminação.");
      } else {
        console.error("Erro de captura:", err);
        setError("Erro ao processar rosto. Tente novamente.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Para a câmera caso esteja ativa
    stopCamera();
    setCameraActive(false);
    setError(null);
    setProcessing(true);

    try {
      const result = await captureDescriptorFromFile(file);
      setCapturedImage(result.imageBase64);
      onCapture(result.imageBase64, result.descriptor);
    } catch (err: any) {
      const msg = err?.message;
      if (msg === "NO_FACE") {
        setError("Nenhum rosto detectado na imagem. Tente outra foto.");
      } else if (msg === "MULTIPLE_FACES") {
        setError("Mais de um rosto na imagem. Envie uma foto com apenas uma pessoa.");
      } else if (msg === "FACE_TOO_SMALL") {
        setError("Rosto muito pequeno na imagem. Envie uma foto mais próxima.");
      } else if (msg === "FACE_NOT_CENTERED") {
        setError("Rosto descentralizado. Envie uma foto com o rosto centralizado.");
      } else if (msg === "FACE_BLURRY") {
        setError("Imagem borrada ou com baixa qualidade. Envie uma foto mais nítida.");
      } else {
        console.error("Erro ao processar arquivo:", err);
        setError("Erro ao processar imagem. Tente novamente.");
      }
    } finally {
      setProcessing(false);
      // Reseta o input para permitir reenvio do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
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
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-2 justify-center flex-wrap">
        {capturedImage ? (
          <Button variant="outline" onClick={handleRetake} size="sm">
            <RotateCcw className="h-4 w-4 mr-1" />
            Tirar Novamente
          </Button>
        ) : cameraActive ? (
          <Button variant="hero" onClick={handleCapture} disabled={processing || !isLoaded} size="sm">
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
          <>
            <Button variant="outline" onClick={handleStartCamera} disabled={!isLoaded || processing} size="sm">
              <Camera className="h-4 w-4 mr-1" />
              Abrir Câmera
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isLoaded || processing}
              size="sm"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Enviar do Dispositivo
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
