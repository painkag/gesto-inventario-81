import React, { useState } from "react";
import { sectorPresets, sectorDisplayNames, sectorDescriptions, type SectorKey } from "@/lib/sectors";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coffee, Wine } from "lucide-react";

interface SectorStepProps {
  onNext: () => void;
}

export default function SectorStep({ onNext }: SectorStepProps) {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const [sector, setSector] = useState<SectorKey>("mercadinho");
  const [saving, setSaving] = useState(false);

  const sectorIcons = {
    padaria: Coffee,
    mercadinho: ShoppingCart,
    adega: Wine,
  };

  async function save() {
    if (!company?.id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const features = [...sectorPresets[sector].features];
    const { error } = await supabase
      .from("companies")
      .update({ sector, sector_features: features })
      .eq("id", company.id);
    
    setSaving(false);
    
    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configuração salva!",
        description: `Seu negócio foi configurado como ${sectorDisplayNames[sector]}.`
      });
      onNext();
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Escolha seu modelo de negócio</h2>
        <p className="text-muted-foreground">
          Selecione o tipo que melhor descreve seu negócio para configurar as funcionalidades ideais.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {(Object.keys(sectorPresets) as SectorKey[]).map((sectorKey) => {
          const IconComponent = sectorIcons[sectorKey];
          const isSelected = sector === sectorKey;
          
          return (
            <Card
              key={sectorKey}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:bg-muted/30 hover:border-primary/50"
              }`}
              onClick={() => setSector(sectorKey)}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {sectorDisplayNames[sectorKey]}
                </CardTitle>
                <CardDescription className="text-sm">
                  {sectorDescriptions[sectorKey]}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Funcionalidades incluídas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {sectorPresets[sectorKey].features.slice(0, 2).map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {sectorPresets[sectorKey].features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{sectorPresets[sectorKey].features.length - 2} mais
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={save} 
          disabled={saving} 
          size="lg"
          className="min-w-32"
        >
          {saving ? "Salvando..." : "Concluir"}
        </Button>
      </div>
    </div>
  );
}