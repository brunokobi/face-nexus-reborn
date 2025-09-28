import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, StopCircle, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  id: string;
  studentName: string;
  studentId: string;
  confidence: number;
  timestamp: Date;
  status: "success" | "warning" | "error";
}

export function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Mock students data - in a real app, this would come from a database
  const mockStudents = [
    { id: "001", name: "Ana Silva" },
    { id: "002", name: "Bruno Costa" },
    { id: "003", name: "Carlos Santos" },
    { id: "004", name: "Diana Oliveira" },
    { id: "005", name: "Eduardo Lima" },
  ];

  useEffect(() => {
    if (isScanning && videoRef.current) {
      startCamera();
    } else if (!isScanning) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start face detection simulation
        simulateFaceDetection();
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast({
        title: "Erro de Câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Simulate face detection and recognition
  const simulateFaceDetection = () => {
    const interval = setInterval(() => {
      if (!isScanning) {
        clearInterval(interval);
        return;
      }

      // Simulate random face detection
      if (Math.random() > 0.7) {
        const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
        const confidence = 0.85 + Math.random() * 0.14; // 85-99% confidence
        
        const result: ScanResult = {
          id: Date.now().toString(),
          studentName: randomStudent.name,
          studentId: randomStudent.id,
          confidence,
          timestamp: new Date(),
          status: confidence > 0.9 ? "success" : confidence > 0.8 ? "warning" : "error"
        };

        setScanResults(prev => [result, ...prev].slice(0, 10)); // Keep only last 10 results

        toast({
          title: `Aluno Reconhecido`,
          description: `${randomStudent.name} - ${(confidence * 100).toFixed(1)}% de confiança`,
          variant: result.status === "error" ? "destructive" : "default"
        });
      }
    }, 3000); // Check every 3 seconds
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
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
      case "error": return AlertCircle;
      default: return User;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold">
            Reconhecimento Facial
          </h1>
          <p className="text-muted-foreground text-lg">
            Posicione-se em frente à câmera para registro de presença
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Câmera de Reconhecimento
                </CardTitle>
                <CardDescription>
                  {isScanning ? "Câmera ativa - Aguardando reconhecimento..." : "Clique em iniciar para ativar a câmera"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Container */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: 'none' }}
                  />
                  
                  {/* Scanning Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-48 border-2 border-primary rounded-lg pulse-scan">
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-accent rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-accent rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-accent rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-accent rounded-br-lg"></div>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                      <div className="text-center space-y-2">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Câmera desativada</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center">
                  <Button
                    variant={isScanning ? "destructive" : "scan"}
                    size="lg"
                    onClick={toggleScanning}
                    className="text-lg px-8 py-6"
                  >
                    {isScanning ? (
                      <>
                        <StopCircle className="h-5 w-5 mr-2" />
                        Parar Escaneamento
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mr-2" />
                        Iniciar Escaneamento
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{scanResults.filter(r => r.status === "success").length}</div>
                    <div className="text-sm text-muted-foreground">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{scanResults.filter(r => r.status === "warning").length}</div>
                    <div className="text-sm text-muted-foreground">Avisos</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{scanResults.length}</div>
                  <div className="text-sm text-muted-foreground">Total Reconhecidos</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Reconhecimentos Recentes</CardTitle>
                <CardDescription>Últimos 10 resultados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum reconhecimento ainda</p>
                    </div>
                  ) : (
                    scanResults.map((result) => {
                      const StatusIcon = getStatusIcon(result.status);
                      return (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-sm text-muted-foreground">ID: {result.studentId}</div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge className={getStatusColor(result.status)}>
                              {(result.confidence * 100).toFixed(1)}%
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.timestamp.toLocaleTimeString()}
                            </div>
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
    </div>
  );
}