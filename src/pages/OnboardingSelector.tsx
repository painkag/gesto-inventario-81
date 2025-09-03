import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectorSelection } from "@/components/onboarding/SectorSelection";
import { supabase } from "@/integrations/supabase/client";
import { useBlueToast } from "@/hooks/useBlueToast";
import { useAuth } from "@/hooks/useAuth";

const OnboardingSelector = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useBlueToast();
  const { user } = useAuth();

  const handleSectorSelect = async (sector: any) => {
    if (!user) {
      showError("Erro", "Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's company
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        throw new Error('Empresa não encontrada');
      }

      // Update company with sector info
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          sector: sector.id,
          sector_features: sector.sector_features
        } as any)
        .eq('id', membership.company_id);

      if (updateError) {
        throw new Error(`Erro ao salvar setor: ${updateError.message}`);
      }

      showSuccess(
        "Configuração salva!",
        `Seu ${sector.name} foi configurado com sucesso. Redirecionando...`
      );

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error saving sector:', error);
      showError(
        "Erro ao configurar setor",
        error.message || "Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectorSelection 
      onSectorSelect={handleSectorSelect}
      isLoading={isLoading}
    />
  );
};

export default OnboardingSelector;