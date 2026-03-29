import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, StopCircle, User, Clock, CheckCircle, AlertCircle, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMediaPipe } from "@/hooks/use-mediapipe";
import { useCamera } from "@/hooks/use-camera";
import { LocationModal } from "@/components/scanner/LocationModal";
import type { Student, AttendanceRecord } from "@/types/student";

interface ScannerPageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  addAttendanceRecord: (record: AttendanceRecord) => void;
}

export function ScannerPage({ students, attendance, addAttendanceRecord }: ScannerPageProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [sessionResults, setSessionResults] = useState<AttendanceRecord[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);
  const { toast } = useToast();
  const { isLoaded, isLoading, loadError, detectFaces, createMatcher } = useMediaPipe();
  const { startCamera, stopCamera } = useCamera();
  const recognizedInSessionRef = useRef<Set<string>>(new Set());

  const cleanupDetection = useCallback(() => {
    isScanningRef.current = false;
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
    stopCamera();
    if (videoRef.current) videoRef.current.srcObject = null;
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext("2d");
      ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => { cleanupDetection(); };
  }, [cleanupDetection]);

  const handleRequestStart = () => {
    if (students.length === 0) {
      toast({
        title: "Nenhum aluno cadastrado",
        description: "Cadastre ao menos um aluno antes de iniciar o reconhecimento.",
        variant: "destructive",
      });
      return;
    }

    const studentsWithFace = students.filter((s) => s.faceDescriptor);
    if (studentsWithFace.length === 0) {
      toast({
        title: "Biometria não cadastrada",
        description: "Os alunos existentes ainda não têm biometria facial salva. Edite o aluno e capture a foto novamente.",
        variant: "destructive",
      });
      return;
    }

    setShowLocationModal(true);
  };

  const handleLocationConfirm = async (location: string) => {
    setShowLocationModal(false);
    setCurrentLocation(location);
    recognizedInSessionRef.current = new Set();
    setSessionResults([]);

    if (!videoRef.current) return;
    const ok = await startCamera(videoRef.current);
    if (!ok) {
      toast({ title: "Erro de Câmera", description: "Não foi possível acessar a câmera.", variant: "destructive" });
      return;
    }
    setIsScanning(true);
    isScanningRef.current = true;
    startDetectionLoop(location);
  };

  const startDetectionLoop = (location: string) => {
    const matcher = createMatcher(students);
    if (!matcher || !videoRef.current || !overlayRef.current) return;

    const video = videoRef.current;
    const overlay = overlayRef.current;

    const detect = async () => {
      if (!isScanningRef.current || !video || video.paused || video.ended) return;

      try {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        overlay.width = vw;
        overlay.height = vh;

        const results = await detectFaces(video);
        const ctx = overlay.getContext("2d")!;
        ctx.clearRect(0, 0, vw, vh);

        for (const detection of results) {
          const { box, descriptor } = detection;
          const bestMatch = matcher.findBestMatch(descriptor);
          const isUnknown = bestMatch.label === "unknown";

          // Converter coordenadas normalizadas (0-1) para pixels
          const px = box.x * vw;
          const py = box.y * vh;
          const pw = box.width * vw;
          const ph = box.height * vh;

          // Confiança: distance 0 = 100%, threshold 0.25 = 0%
          const confidence = Math.max(0, Math.min(1, 1 - bestMatch.distance / 0.25));
          const student = students.find((s) => s.id === bestMatch.label);

          // Bounding box
          ctx.strokeStyle = isUnknown ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, pw, ph);

          // Label
          const label = isUnknown
            ? "Desconhecido"
            : `${student?.name || bestMatch.label} (${(confidence * 100).toFixed(0)}%)`;
          ctx.font = "14px sans-serif";
          const textWidth = ctx.measureText(label).width;
          ctx.fillStyle = isUnknown ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)";
          ctx.fillRect(px, py - 24, textWidth + 16, 24);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, px + 8, py - 7);

          // Registrar presença (1x por sessão por aluno)
          if (!isUnknown && student && !recognizedInSessionRef.current.has(student.id)) {
            recognizedInSessionRef.current.add(student.id);
            const status = confidence > 0.7 ? "success" : confidence > 0.5 ? "warning" : "error";
            const record: AttendanceRecord = {
              id: crypto.randomUUID(),
              studentId: student.id,
              studentName: student.name,
              timestamp: new Date(),
              confidence,
              location,
              status: status as "success" | "warning" | "error",
            };
            addAttendanceRecord(record);
            setSessionResults((prev) => [record, ...prev]);
            toast({
              title: "Aluno Reconhecido",
              description: `${student.name} — ${(confidence * 100).toFixed(1)}% — ${location}`,
            });
          }
        }
      } catch (err) {
        console.error("Erro de detecção:", err);
      }

      if (isScanningRef.current) {
        detectionLoopRef.current = requestAnimationFrame(detect);
      }
    };

    if (video.readyState >= 2) {
      detectionLoopRef.current = requestAnimationFrame(detect);
    } else {
      video.addEventListener("playing", () => {
        if (isScanningRef.current) {
          detectionLoopRef.current = requestAnimationFrame(detect);
        }
      }, { once: true });
    }
  };

  const handleStop = () => {
    setIsScanning(false);
    cleanupDetection();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-success text-success-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      case "error": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return CheckCircle;
      case "warning": return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold">Reconhecimento Facial</h1>
          <p className="text-muted-foreground text-lg">
            {isScanning ? `Escaneando em: ${currentLocation}` : "Inicie o reconhecimento para registrar presenças"}
          </p>
          {(isLoading || loadError) && (
            <div className="flex items-center justify-center gap-2">
              {isLoading && <><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-muted-foreground">Carregando modelos de IA...</span></>}
              {loadError && <span className="text-destructive">{loadError}</span>}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Câmera de Reconhecimento</CardTitle>
                <CardDescription>
                  {isScanning ? (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {currentLocation} — Detectando rostos em tempo real</span>
                  ) : "Clique em iniciar para configurar o local e ativar a câmera"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
                  {isScanning && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-destructive text-destructive-foreground animate-pulse">● REC</Badge>
                    </div>
                  )}
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Câmera desativada</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  {isScanning ? (
                    <Button variant="destructive" size="lg" onClick={handleStop} className="text-lg px-8 py-6">
                      <StopCircle className="h-5 w-5 mr-2" /> Parar Escaneamento
                    </Button>
                  ) : (
                    <Button variant="scan" size="lg" onClick={handleRequestStart} disabled={!isLoaded || isLoading} className="text-lg px-8 py-6">
                      <Camera className="h-5 w-5 mr-2" /> Iniciar Escaneamento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-lg">Estatísticas da Sessão</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{sessionResults.filter((r) => r.status === "success").length}</div>
                    <div className="text-sm text-muted-foreground">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{sessionResults.filter((r) => r.status === "warning").length}</div>
                    <div className="text-sm text-muted-foreground">Avisos</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{sessionResults.length}</div>
                  <div className="text-sm text-muted-foreground">Total Reconhecidos</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Reconhecimentos Recentes</CardTitle>
                <CardDescription>Sessão atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessionResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum reconhecimento ainda</p>
                    </div>
                  ) : (
                    sessionResults.map((result) => {
                      const StatusIcon = getStatusIcon(result.status);
                      return (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {result.location}</div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className={getStatusColor(result.status)}>{(result.confidence * 100).toFixed(1)}%</Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{result.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <LocationModal open={showLocationModal} onConfirm={handleLocationConfirm} onCancel={() => setShowLocationModal(false)} />
    </div>
  );
}
