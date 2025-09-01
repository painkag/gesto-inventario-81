import { useToast } from "@/hooks/use-toast";

export const useBlueToast = () => {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: "bg-primary text-primary-foreground border-primary/20",
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: "bg-primary/10 text-primary border-primary/20",
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
};