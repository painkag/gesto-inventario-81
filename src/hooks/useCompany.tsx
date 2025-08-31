import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["company", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: membership } = await supabase
        .from("memberships")
        .select(`
          company_id,
          companies (
            id,
            name,
            document,
            phone,
            plan,
            trial_ends_at
          )
        `)
        .eq("user_id", user.id)
        .single();

      return membership?.companies || null;
    },
    enabled: !!user?.id,
  });
}