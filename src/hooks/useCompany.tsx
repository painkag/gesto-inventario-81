import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface CompanyWithRole {
  company: {
    id: string;
    name: string;
    document: string | null;
    phone: string | null;
    plan: string | null;
    trial_ends_at: string | null;
    sector: string | null;
    sector_features: string[] | null;
  } | null;
  role: UserRole | null;
  isOwner: boolean;
  isStaff: boolean;
}

export function useCompany() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["company", user?.id],
    queryFn: async (): Promise<CompanyWithRole> => {
      if (!user?.id) {
        return {
          company: null,
          role: null,
          isOwner: false,
          isStaff: false,
        };
      }
      
      const { data: membership } = await supabase
        .from("memberships")
        .select(`
          company_id,
          role,
          companies (
            id,
            name,
            document,
            phone,
            plan,
            trial_ends_at,
            sector,
            sector_features
          )
        `)
        .eq("user_id", user.id)
        .single();

      const role = membership?.role || null;
      
      return {
        company: membership?.companies || null,
        role,
        isOwner: role === "OWNER",
        isStaff: role === "STAFF",
      };
    },
    enabled: !!user?.id,
  });

  return {
    data: query.data?.company || null,
    role: query.data?.role || null,
    isOwner: query.data?.isOwner || false,
    isStaff: query.data?.isStaff || false,
    isLoading: query.isLoading,
    error: query.error,
  };
}