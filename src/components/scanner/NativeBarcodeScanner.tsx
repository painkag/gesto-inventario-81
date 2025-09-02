"use client";
import { useEffect, useRef, useState } from "react";

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string>();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    let animationFrame: number;
    
    const startScanning = async () => {
      try {
        setIsScanning(true);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // @ts-ignore - BarcodeDetector is experimental
        if ("BarcodeDetector" in window) {
          // @ts-ignore
          const detector = new window.BarcodeDetector({ 
            formats: ["ean_13", "code_128", "qr_code", "ean_8", "code_39"] 
          });
          
          const tick = async () => {
            if (!videoRef.current || videoRef.current.paused) return;
            
            try {
              const bitmap = await createImageBitmap(videoRef.current);
              const codes = await detector.detect(bitmap);
              
              if (codes?.[0]?.rawValue) {
                onScan(codes[0].rawValue);
                console.log('Barcode detected:', codes[0].rawValue);
              }
              
              animationFrame = requestAnimationFrame(tick);
            } catch (error) {
              console.error('Barcode detection error:', error);
              animationFrame = requestAnimationFrame(tick);
            }
          };
          
          animationFrame = requestAnimationFrame(tick);
        } else {
          setErr("BarcodeDetector não suportado — instale como app mobile ou use Chrome/Edge.");
        }
      } catch (error: any) { 
        setErr(`Erro ao acessar câmera: ${error.message}`);
        setIsScanning(false);
      }
    };

    startScanning();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsScanning(false);
    };
  }, [onScan]);

  return (
    <div className="relative">
      <video 
        ref={videoRef} 
        className="w-full rounded-lg bg-black" 
        muted 
        playsInline 
        autoPlay
      />
      
      {/* Scanning overlay */}
      {isScanning && !err && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-primary rounded-lg opacity-50">
            <div className="w-full h-0.5 bg-primary animate-pulse absolute top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
              Aponte a câmera para o código de barras
            </p>
          </div>
        </div>
      )}
      
      {err && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
          <div className="text-center p-4">
            <p className="text-red-400 text-sm mb-2">{err}</p>
            <p className="text-white text-xs">
              Para melhor experiência, instale como app mobile
            </p>
          </div>
        </div>
      )}
    </div>
  );
}