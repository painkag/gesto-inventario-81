import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useEffect } from '@/lib/react-safe';
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface CompanyData {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  plan: string | null;
  trial_ends_at: string | null;
  sector: string | null;
  sector_features: any[] | null;
}

interface CompanyWithRole {
  company: CompanyData | null;
  role: UserRole | null;
  isOwner: boolean;
  isStaff: boolean;
}

export function useCompany() {
  const { user } = useAuth();
  const [data, setData] = useState<CompanyData | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      console.log('[COMPANY] No user ID, setting defaults');
      setData(null);
      setRole(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchCompanyData = async () => {
      try {
        console.log('[COMPANY] Fetching company data for user:', user.id);
        setIsLoading(true);
        
        const { data: membership, error: fetchError } = await supabase
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
          .maybeSingle();

        if (fetchError) {
          console.error('[COMPANY] Error fetching membership:', fetchError);
          setError(fetchError);
        } else {
          console.log('[COMPANY] Membership data:', membership);
          setData(membership?.companies as CompanyData | null);
          setRole(membership?.role || null);
          console.log('[COMPANY] User role:', membership?.role);
          setError(null);
        }
      } catch (err) {
        console.error('[COMPANY] Unexpected error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user?.id]);

  return {
    data,
    role,
    isOwner: role === "OWNER",
    isStaff: role === "STAFF",
    isLoading,
    error,
  };
}