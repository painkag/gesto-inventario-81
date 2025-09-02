import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeReaderProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export function BarcodeReader({ onBarcodeDetected, onClose, isActive }: BarcodeReaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setError('');
      startBarcodeDetection();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startBarcodeDetection = () => {
    // Check if BarcodeDetector is available
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39']
      });

      const detectBarcodes = async () => {
        if (videoRef.current && canvasRef.current && isActive) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (ctx && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            try {
              const barcodes = await barcodeDetector.detect(canvas);
              if (barcodes.length > 0) {
                const barcode = barcodes[0].rawValue;
                onBarcodeDetected(barcode);
                toast({
                  title: "Código detectado",
                  description: `Código: ${barcode}`
                });
                return;
              }
            } catch (err) {
              console.error('Barcode detection error:', err);
            }
          }

          // Continue scanning
          requestAnimationFrame(detectBarcodes);
        }
      };

      detectBarcodes();
    } else {
      setError('Scanner de código de barras não é suportado neste navegador.');
      toast({
        title: "Recurso não suportado",
        description: "Scanner de código de barras não é suportado neste navegador.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <Camera className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover rounded-lg"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-white rounded-lg w-48 h-32 flex items-center justify-center">
              <div className="animate-pulse">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <p className="text-center text-sm text-white mt-2">
          Posicione o código de barras dentro do quadro
        </p>
      </div>
    </div>
  );
}