import React, { useState, useEffect, useCallback, useRef } from "react";

interface UseBarcodeDetectorOptions {
  onScanSuccess: (barcode: string) => void;
  onError?: (error: string) => void;
}

// BarcodeDetector interface for browsers that support it
interface BarcodeDetector {
  detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new(options?: { formats: string[] }): BarcodeDetector;
      getSupportedFormats(): Promise<string[]>;
    };
  }
}

export function useBarcodeScanner({ onScanSuccess, onError }: UseBarcodeDetectorOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);

  // Initialize barcode detector
  useEffect(() => {
    const initializeDetector = async () => {
      if (typeof window !== 'undefined' && window.BarcodeDetector) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          console.log('Supported barcode formats:', formats);
          
          detectorRef.current = new window.BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
          });
          
          console.log('BarcodeDetector initialized successfully');
        } catch (error) {
          console.warn('BarcodeDetector initialization failed:', error);
          detectorRef.current = null;
        }
      } else {
        console.warn('BarcodeDetector not supported in this browser');
        detectorRef.current = null;
      }
    };

    initializeDetector();
  }, []);

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      setPermissionError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setHasPermission(true);
      setStream(mediaStream);
      return mediaStream;
    } catch (error: any) {
      console.error('Camera permission denied:', error);
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Permissão de câmera negada pelo usuário'
        : `Erro ao acessar câmera: ${error.message}`;
      
      setPermissionError(errorMessage);
      setHasPermission(false);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw error;
    }
  }, [onError]);

  // Scan barcode from video frame
  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current) {
      return;
    }

    try {
      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect barcodes
      const barcodes = await detectorRef.current.detect(canvas);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        console.log('Barcode detected:', barcode);
        
        setLastScannedCode(barcode);
        onScanSuccess(barcode);
        
        // Stop scanning after successful detection
        stopScanning();
      }
    } catch (error: any) {
      console.error('Error during barcode detection:', error);
      
      // Don't show errors for every frame, only for critical issues
      if (error.name !== 'NotSupportedError') {
        console.warn('Barcode detection error:', error.message);
      }
    }
  }, [onScanSuccess]);

  // Start scanning
  const startScanning = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      videoRef.current = videoElement;
      
      let mediaStream = stream;
      
      // Request permission if not already granted
      if (!hasPermission || !mediaStream) {
        mediaStream = await requestPermission();
      }

      if (!mediaStream || !videoElement) {
        throw new Error('No media stream or video element available');
      }

      // Set video source
      videoElement.srcObject = mediaStream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve();
        videoElement.onerror = () => reject(new Error('Video loading failed'));
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Video loading timeout')), 5000);
      });

      await videoElement.play();
      
      setIsScanning(true);

      // Start scanning interval if BarcodeDetector is available
      if (detectorRef.current) {
        scanIntervalRef.current = setInterval(scanFrame, 500); // Scan every 500ms
        console.log('Barcode scanning started with BarcodeDetector');
      } else {
        // Fallback: Manual barcode scanning would be implemented here
        console.warn('BarcodeDetector not available - manual input required');
        
        if (onError) {
          onError('Scanner automático não disponível. Use o modo manual para inserir códigos.');
        }
      }

    } catch (error: any) {
      console.error('Failed to start scanning:', error);
      setIsScanning(false);
      
      const errorMessage = error.name === 'NotAllowedError'
        ? 'Permissão de câmera negada'
        : `Falha ao iniciar scanner: ${error.message}`;
        
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [hasPermission, stream, requestPermission, scanFrame, onError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop video stream
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    console.log('Barcode scanning stopped');
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    hasPermission,
    permissionError,
    lastScannedCode,
    startScanning,
    stopScanning,
    requestPermission,
    isSupported: !!window.BarcodeDetector
  };
}