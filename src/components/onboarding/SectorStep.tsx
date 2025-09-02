import React, { useState } from "react";
import { sectorPresets, type SectorKey } from "@/config/sectors";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";

interface SectorStepProps {
  onNext: () => void;
}

export default function SectorStep({ onNext }: SectorStepProps) {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const [sector, setSector] = useState<SectorKey>("mercadinho");
  const [saving, setSaving] = useState(false);

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
        description: `Seu negócio foi configurado como ${getSectorLabel(sector)}.`
      });
      onNext();
    }
  }

  const getSectorLabel = (k: SectorKey) => {
    const labels = {
      padaria: "Mini Padaria",
      mercadinho: "Mercadinho", 
      adega: "Adega/Bar"
    };
    return labels[k];
  };

  const getSectorDesc = (k: SectorKey) => {
    const descriptions = {
      padaria: "Vender por KG • Receitas • Produção do dia",
      mercadinho: "FEFO • Importar NF-e (XML) • Promoções",
      adega: "Comandas • Clube • Notas de degustação"
    };
    return descriptions[k];
  };

  const Card = ({ k, label, desc }: { k: SectorKey; label: string; desc: string }) => (
    <button 
      onClick={() => setSector(k)} 
      className={`rounded-xl p-4 border text-left transition-all ${
        sector === k 
          ? "border-primary bg-primary/5 ring-2 ring-primary" 
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <div className="text-lg font-medium">{label}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Escolha seu modelo de negócio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o tipo que melhor descreve seu negócio para configurar as funcionalidades ideais.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card k="padaria" label="Mini Padaria" desc={getSectorDesc("padaria")} />
        <Card k="mercadinho" label="Mercadinho" desc={getSectorDesc("mercadinho")} />
        <Card k="adega" label="Adega/Bar" desc={getSectorDesc("adega")} />
      </div>
      
      <div className="flex justify-center pt-4">
        <button 
          onClick={save} 
          disabled={saving} 
          className="rounded-lg px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 min-w-32"
        >
          {saving ? "Salvando..." : "Concluir"}
        </button>
      </div>
    </div>
  );
}