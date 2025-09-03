import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  X, 
  Scan,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string; format: string }>>;
    };
  }
}

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if BarcodeDetector is supported
  useEffect(() => {
    setIsSupported('BarcodeDetector' in window);
  }, []);

  // Initialize scanner when opened
  useEffect(() => {
    if (isOpen && isSupported) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, isSupported]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize BarcodeDetector
      if (window.BarcodeDetector) {
        detectorRef.current = new window.BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        
        // Start scanning
        setIsScanning(true);
        startScanning();
      }

    } catch (err: any) {
      console.error('Error initializing scanner:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Permissão de câmera negada. Permita o acesso à câmera para escanear códigos de barras.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else {
        setError('Erro ao acessar a câmera. Tente novamente.');
      }
    }
  };

  const startScanning = () => {
    if (!detectorRef.current || !videoRef.current) return;

    scanIntervalRef.current = setInterval(async () => {
      try {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detectedCodes = await detectorRef.current.detect(videoRef.current);
          
          if (detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;
            if (code && code !== lastScan) {
              setLastScan(code);
              onScan(code);
              // Brief pause after successful scan
              setTimeout(() => setLastScan(null), 2000);
            }
          }
        }
      } catch (err) {
        console.error('Error detecting barcode:', err);
      }
    }, 100); // Scan every 100ms
  };

  const stopScanner = () => {
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              <CardTitle>Scanner de Código de Barras</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Posicione o código de barras dentro do quadro para escanear
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Support Check */}
          {isSupported === false && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Scanner não suportado</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Seu navegador não suporta o scanner automático. Use um navegador moderno como Chrome ou Edge.
              </p>
            </div>
          )}

          {/* Permission Error */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Erro de câmera</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={initializeScanner}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Camera View */}
          {isSupported && !error && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={cn(
                  "border-2 border-dashed rounded-lg transition-colors duration-300",
                  "w-64 h-32",
                  lastScan 
                    ? "border-green-500 bg-green-500/10" 
                    : isScanning 
                      ? "border-primary bg-primary/10" 
                      : "border-muted-foreground"
                )}>
                  <div className="w-full h-full flex items-center justify-center">
                    {lastScan ? (
                      <div className="text-center text-green-600">
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Escaneado!</span>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Scan className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs">Posicione o código aqui</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isScanning ? "bg-green-500" : "bg-muted-foreground"
              )} />
              <span className="text-sm">
                {isScanning ? 'Scanner ativo' : 'Scanner inativo'}
              </span>
            </div>
            
            {lastScan && (
              <Badge variant="secondary" className="font-mono">
                {lastScan}
              </Badge>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">
              Problemas com o scanner? Digite o código manualmente:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite o código de barras"
                className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      onScan(target.value.trim());
                      target.value = '';
                    }
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    onScan(input.value.trim());
                    input.value = '';
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { BarcodeScanner };
export default BarcodeScanner;