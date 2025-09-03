import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Scan } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              <CardTitle>Scanner de Código</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Digite ou escaneie o código do produto
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Código do produto:</label>
            <input
              type="text"
              placeholder="Digite o código..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
              autoFocus
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
              className="flex-1"
            >
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BarcodeScanner;