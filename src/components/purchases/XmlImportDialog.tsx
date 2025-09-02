import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useXmlImport } from "@/hooks/useXmlImport";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export function XmlImportDialog() {
  const [open, setOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  const { importXml, isImporting } = useXmlImport();
  const { hasFeature } = useFeatureFlags();

  const isXmlImportEnabled = hasFeature("nfePurchaseXml");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!xmlContent.trim()) return;

    try {
      await importXml({ xmlContent });
      setXmlContent("");
      setOpen(false);
    } catch (error) {
      // Error handled by the hook
    }
  };

  if (!isXmlImportEnabled) {
    return (
      <Button variant="outline" disabled>
        <Upload className="h-4 w-4 mr-2" />
        Importar XML
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar XML NFe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar XML da Nota Fiscal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selecione um arquivo XML de NFe ou cole o conteúdo diretamente no campo abaixo.
              Os produtos e informações de compra serão extraídos automaticamente.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="xml-file">Arquivo XML</Label>
            <input
              id="xml-file"
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xml-content">Ou cole o conteúdo XML</Label>
            <Textarea
              id="xml-content"
              placeholder="Cole aqui o conteúdo do arquivo XML da NFe..."
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!xmlContent.trim() || isImporting}
            >
              {isImporting ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}