import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  File, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportedProduct {
  codigo: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  ncm?: string;
  cfop?: string;
  status: "success" | "warning" | "error";
  motivo?: string;
}

interface ImportSummary {
  totalItens: number;
  processados: number;
  sucessos: number;
  avisos: number;
  erros: number;
  valorTotal: number;
}

export function XmlImportComponent() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.toLowerCase().endsWith('.xml')
    );
    
    if (droppedFiles.length === 0) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos XML.",
        variant: "destructive"
      });
      return;
    }
    
    setFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.name.toLowerCase().endsWith('.xml')
      );
      setFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processXmlFile = async (file: File): Promise<ImportedProduct[]> => {
    // Simular processamento de arquivo XML
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados simulados de produtos extraídos do XML
    const mockProducts: ImportedProduct[] = [
      {
        codigo: "7891234567890",
        nome: "Produto A - NFe Teste",
        quantidade: 10,
        valorUnitario: 25.50,
        valorTotal: 255.00,
        ncm: "12345678",
        cfop: "5102",
        status: "success"
      },
      {
        codigo: "7891234567891",
        nome: "Produto B - NFe Teste",
        quantidade: 5,
        valorUnitario: 45.00,
        valorTotal: 225.00,
        ncm: "87654321",
        cfop: "5102",
        status: "warning",
        motivo: "Produto já existe no sistema"
      },
      {
        codigo: "INVALID_CODE",
        nome: "Produto C - Código Inválido",
        quantidade: 2,
        valorUnitario: 15.00,
        valorTotal: 30.00,
        status: "error",
        motivo: "Código de barras inválido"
      }
    ];

    return mockProducts.map(product => ({
      ...product,
      // Simular diferentes status baseado no arquivo
      status: Math.random() > 0.7 ? "error" : Math.random() > 0.4 ? "warning" : "success"
    }));
  };

  const handleImport = async () => {
    if (files.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione pelo menos um arquivo XML para importar.",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setImportedProducts([]);
    
    try {
      let allProducts: ImportedProduct[] = [];
      
      for (let i = 0; i < files.length; i++) {
        setProgress(((i + 1) / files.length) * 100);
        const products = await processXmlFile(files[i]);
        allProducts = [...allProducts, ...products];
      }
      
      setImportedProducts(allProducts);
      
      // Calcular resumo
      const summary: ImportSummary = {
        totalItens: allProducts.length,
        processados: allProducts.length,
        sucessos: allProducts.filter(p => p.status === "success").length,
        avisos: allProducts.filter(p => p.status === "warning").length,
        erros: allProducts.filter(p => p.status === "error").length,
        valorTotal: allProducts.reduce((sum, p) => sum + p.valorTotal, 0)
      };
      
      setImportSummary(summary);
      setShowResults(true);
      
      toast({
        title: "Importação concluída!",
        description: `${summary.sucessos} produtos importados com sucesso.`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar os arquivos XML.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case "warning":
        return <Badge variant="secondary">Aviso</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Resultado da Importação</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowResults(false);
              setFiles([]);
              setImportedProducts([]);
              setImportSummary(null);
            }}
          >
            Nova Importação
          </Button>
        </div>

        {/* Resumo */}
        {importSummary && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{importSummary.totalItens}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Sucessos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{importSummary.sucessos}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-600">Avisos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{importSummary.avisos}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600">Erros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{importSummary.erros}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{formatCurrency(importSummary.valorTotal)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Processados</CardTitle>
            <CardDescription>
              Detalhes dos produtos extraídos dos arquivos XML
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{product.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.nome}</div>
                        {product.motivo && (
                          <div className="text-sm text-muted-foreground">{product.motivo}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{product.quantidade}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.valorUnitario)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.valorTotal)}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Importação de XML - NFe</h2>
        <p className="text-muted-foreground">
          Importe produtos diretamente de arquivos XML de Notas Fiscais Eletrônicas
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Selecionar Arquivos XML
          </CardTitle>
          <CardDescription>
            Arraste arquivos XML ou clique para selecionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {dragActive ? "Solte os arquivos aqui" : "Arraste arquivos XML aqui"}
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar arquivos
                </p>
              </div>
              
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  accept=".xml"
                  onChange={handleFileInput}
                  className="hidden"
                  id="xml-upload"
                />
                <Label htmlFor="xml-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Selecionar Arquivos</span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* Lista de Arquivos */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Arquivos Selecionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={importing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A importação irá extrair os produtos das NFes e criar/atualizar no seu estoque. 
              Produtos duplicados serão sinalizados para revisão.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label>Ações Automáticas:</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Criar produtos que não existem no sistema</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Atualizar preços de custo dos produtos existentes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Adicionar quantidade ao estoque existente</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Importar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {files.length} arquivo(s) selecionado(s)
        </div>
        
        <Button 
          onClick={handleImport}
          disabled={files.length === 0 || importing}
          className="gap-2"
        >
          {importing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-foreground" />
              Importando...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4" />
              Iniciar Importação
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {importing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando arquivos XML...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}