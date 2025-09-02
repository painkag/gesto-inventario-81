import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cake, 
  ShoppingCart, 
  Wine, 
  Package2, 
  Calculator,
  Receipt,
  BarChart3,
  Users
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";

interface SectorOption {
  id: 'padaria' | 'mercadinho' | 'adega';
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  color: string;
}

const sectorOptions: SectorOption[] = [
  {
    id: 'padaria',
    name: 'Padaria',
    description: 'Ideal para padarias, confeitarias e panificadoras',
    icon: Cake,
    features: ['Controle por peso (KG)', 'Receitas e formulações', 'Controle de produção', 'Etiquetas personalizadas'],
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'mercadinho',
    name: 'Mercadinho',
    description: 'Perfeito para supermercados, mercadinhos e lojas de conveniência',
    icon: ShoppingCart,
    features: ['Import XML NF-e', 'Sistema de promoções', 'Código de barras', 'Múltiplas unidades'],
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'adega',
    name: 'Adega/Bar',
    description: 'Especial para adegas, bares, restaurantes e distribuidoras',
    icon: Wine,
    features: ['Sistema de comandas', 'Clube de fidelidade', 'Controle por lote', 'Vendas por mesa'],
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

const commonFeatures = [
  { icon: Package2, label: 'Controle de estoque FEFO' },
  { icon: Calculator, label: 'PDV com scanner' },
  { icon: Receipt, label: 'Emissão de recibos' },
  { icon: BarChart3, label: 'Relatórios e dashboards' },
  { icon: Users, label: 'Multi-usuário com permissões' }
];

interface SectorStepProps {
  onNext: () => void;
}

export default function SectorStep({ onNext }: SectorStepProps) {
  const { toast } = useToast();
  const { updateSector, isUpdating } = useOnboarding();
  const [selectedSector, setSelectedSector] = useState<'padaria' | 'mercadinho' | 'adega' | null>(null);

  const handleContinue = async () => {
    if (!selectedSector) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, escolha o tipo do seu negócio para continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSector(selectedSector);
      toast({
        title: "Configuração salva!",
        description: `Seu negócio foi configurado como ${sectorOptions.find(s => s.id === selectedSector)?.name}.`
      });
      onNext();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar sua configuração. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sector Selection */}
      <div className="grid gap-4 md:grid-cols-3">
        {sectorOptions.map((sector) => {
          const Icon = sector.icon;
          const isSelected = selectedSector === sector.id;
          
          return (
            <Card 
              key={sector.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedSector(sector.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${sector.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm">{sector.name}</h3>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 bg-primary rounded-full" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sector.description}
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Funcionalidades exclusivas:</p>
                  <div className="flex flex-wrap gap-1">
                    {sector.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Common Features */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-center">
          ✨ Funcionalidades incluídas em todos os planos:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {commonFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span>{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleContinue}
          disabled={!selectedSector || isUpdating}
          size="lg"
          className="min-w-48"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Configurando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </div>
  );
}