import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCompany() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: m } = await supabase
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
          .limit(1)
          .single();
        
        if (m?.company_id) {
          setCompany(m.companies);
          setRole(m.role);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { 
    company, 
    loading, 
    companyId: company?.id, 
    sector: company?.sector, 
    sector_features: company?.sector_features || [],
    data: company,
    role,
    isOwner: role === "OWNER",
    isStaff: role === "STAFF", 
    isLoading: loading,
    error
  };
}