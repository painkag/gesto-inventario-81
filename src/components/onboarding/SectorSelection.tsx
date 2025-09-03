import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Cookie, 
  Wine, 
  ArrowRight, 
  Check,
  ShoppingCart,
  Archive,
  Users,
  BarChart3,
  Utensils,
  Coffee
} from "lucide-react";

const sectorOptions = [
  {
    id: 'mercadinho',
    name: 'Mercadinho',
    description: 'Comércio geral, conveniência, mercearia',
    icon: Store,
    color: 'from-blue-500 to-blue-600',
    features: [
      'PDV completo',
      'Gestão de estoque',
      'Promoções',
      'Import NF-e XML',
      'Relatórios de vendas'
    ],
    sector_features: [
      'pos',
      'inventory', 
      'promotions',
      'nfe_import',
      'sales_reports'
    ]
  },
  {
    id: 'padaria',
    name: 'Mini Padaria',
    description: 'Produção própria, receitas, vendas por peso',
    icon: Cookie,
    color: 'from-orange-500 to-orange-600',
    features: [
      'BOM/Receitas',
      'Produção própria',
      'Venda por KG',
      'Etiquetas',
      'Controle de validade'
    ],
    sector_features: [
      'pos',
      'inventory',
      'bom_recipes',
      'production',
      'weight_sales',
      'labels',
      'expiry_control'
    ]
  },
  {
    id: 'adega',
    name: 'Adega/Bar',
    description: 'Bebidas, comandas, clube de vinhos',
    icon: Wine,
    color: 'from-purple-500 to-purple-600',
    features: [
      'Comandas digitais',
      'Clube de vinhos',
      'Notas de degustação',
      'Controle de temperatura',
      'Eventos'
    ],
    sector_features: [
      'pos',
      'inventory',
      'digital_tabs',
      'wine_club',
      'tasting_notes',
      'temperature_control',
      'events'
    ]
  }
];

interface SectorSelectionProps {
  onSectorSelect: (sector: typeof sectorOptions[0]) => void;
  isLoading?: boolean;
}

export function SectorSelection({ onSectorSelect, isLoading = false }: SectorSelectionProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const handleSelect = (sector: typeof sectorOptions[0]) => {
    setSelectedSector(sector.id);
    onSectorSelect(sector);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-primary rounded-lg shadow-apple">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">Estoque Manager</h1>
              <p className="text-muted-foreground">Escolha o tipo do seu negócio</p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground">
              Personalize sua experiência com funcionalidades específicas para seu setor
            </p>
          </div>
        </div>

        {/* Sector Options */}
        <div className="grid gap-6 md:grid-cols-3">
          {sectorOptions.map((sector) => {
            const isSelected = selectedSector === sector.id;
            const Icon = sector.icon;
            
            return (
              <Card 
                key={sector.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-apple-lg relative overflow-hidden ${
                  isSelected ? 'ring-2 ring-primary shadow-apple-lg scale-105' : 'hover:scale-105'
                }`}
                onClick={() => handleSelect(sector)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 bg-gradient-to-r ${sector.color} rounded-xl shadow-apple`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl">{sector.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {sector.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Funcionalidades:</h4>
                    <div className="flex flex-wrap gap-1">
                      {sector.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {sector.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{sector.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    className="w-full gap-2"
                    disabled={isLoading}
                  >
                    {isLoading && selectedSector === sector.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        Configurando...
                      </>
                    ) : isSelected ? (
                      <>
                        <Check className="h-4 w-4" />
                        Selecionado
                      </>
                    ) : (
                      <>
                        Escolher {sector.name}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Você poderá alterar essa configuração posteriormente nas configurações</p>
        </div>
      </div>
    </div>
  );
}