import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface XmlImportRequest {
  xmlContent: string;
}

interface XmlImportResponse {
  success: boolean;
  message: string;
  companyId: string;
  sector: string;
}

export function useXmlImport() {
  const { toast } = useToast();

  const checkFeatureAvailability = async () => {
    const { data, error } = await supabase.functions.invoke('import-xml-nfe', {
      method: 'GET'
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const importXml = useMutation({
    mutationFn: async (request: XmlImportRequest): Promise<XmlImportResponse> => {
      const { data, error } = await supabase.functions.invoke('import-xml-nfe', {
        body: request
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Importação concluída!",
        description: data.message
      });
    },
    onError: (error: any) => {
      console.error('XML import error:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido';
      
      if (error?.message?.includes('Feature não habilitada')) {
        toast({
          title: "Recurso não disponível",
          description: "A importação de XML não está habilitada para o seu tipo de negócio.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na importação",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
  });

  return {
    importXml: importXml.mutateAsync,
    isImporting: importXml.isPending,
    error: importXml.error,
    checkFeatureAvailability
  };
}