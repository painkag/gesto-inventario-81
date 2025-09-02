import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Camera, X, Keyboard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ 
  open, 
  onOpenChange, 
  onScanSuccess, 
  onError 
}: BarcodeScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualCode, setManualCode] = useState("");
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");

  const {
    isScanning,
    hasPermission,
    permissionError,
    lastScannedCode,
    startScanning,
    stopScanning,
    requestPermission
  } = useBarcodeScanner({
    onScanSuccess: (barcode) => {
      onScanSuccess(barcode);
      onOpenChange(false);
      toast({
        title: "Código escaneado!",
        description: `Código: ${barcode}`,
      });
    },
    onError: (error) => {
      console.error('Scanner error:', error);
      const errorMessage = error.includes('NotAllowedError') 
        ? "Permissão de câmera negada. Permita o acesso à câmera para escanear códigos." 
        : "Erro ao acessar câmera. Tente usar o modo manual.";
      
      if (onError) onError(errorMessage);
      toast({
        title: "Erro no scanner",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (open && activeTab === "camera" && videoRef.current && hasPermission) {
      startScanning(videoRef.current);
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open, activeTab, hasPermission, startScanning, stopScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      setManualCode("");
      onOpenChange(false);
      toast({
        title: "Código inserido!",
        description: `Código: ${manualCode.trim()}`,
      });
    }
  };

  const handleCameraPermission = async () => {
    try {
      await requestPermission();
      if (hasPermission && videoRef.current) {
        startScanning(videoRef.current);
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ScanLine className="h-5 w-5" />
            <span>Scanner de Código de Barras</span>
          </DialogTitle>
          <DialogDescription>
            Escaneie o código de barras do produto ou digite manualmente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "camera" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Câmera</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Keyboard className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {!hasPermission ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {permissionError 
                          ? "Permissão de câmera negada. Para escanear códigos, é necessário permitir o acesso à câmera."
                          : "Para escanear códigos de barras, precisamos acessar sua câmera."
                        }
                      </p>
                      <Button 
                        onClick={handleCameraPermission}
                        className="w-full"
                        variant={permissionError ? "outline" : "default"}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {permissionError ? "Tentar Novamente" : "Permitir Câmera"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-48 object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-2 border-primary bg-primary/10 rounded-lg p-2">
                            <ScanLine className="h-8 w-8 text-primary animate-pulse" />
                          </div>
                        </div>
                      )}
                      {!isScanning && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white space-y-2">
                            <AlertCircle className="h-8 w-8 mx-auto" />
                            <p className="text-sm">Câmera não disponível</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isScanning 
                          ? "Posicione o código de barras dentro da área de escaneamento"
                          : "Iniciando câmera..."
                        }
                      </p>
                      {lastScannedCode && (
                        <div className="flex items-center justify-center space-x-2 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm">Último código: {lastScannedCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => isScanning ? stopScanning() : startScanning(videoRef.current!)}
                        disabled={!videoRef.current}
                        className="flex-1"
                      >
                        {isScanning ? "Parar" : "Iniciar"} Escaneamento
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-code">Código de Barras</Label>
                    <Input
                      id="manual-code"
                      type="text"
                      placeholder="Digite o código de barras..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      autoFocus
                      className="text-center font-mono"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      Digite o código de barras manualmente ou use um leitor de códigos conectado
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={!manualCode.trim()}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar Código
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}