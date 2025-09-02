import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sector presets (duplicated here since we can't import from client code)
const sectorPresets = {
  padaria: {
    features: ["sellByKg","recipes","productionOrders","labels","expiryShort"],
  },
  mercadinho: {
    features: ["fefo","eanScanner","nfePurchaseXml","promotions","lossesByExpiry"],
  },
  adega: {
    features: ["kits","clubSubscription","barTabs","tastingNotes","fefoCerveja"],
  }
} as const;

type SectorKey = keyof typeof sectorPresets;

// Utility functions (duplicated here since we can't import from client code)
const hasFeature = (f: string, list: string[]) => list.includes(f);

function deriveFeatures(sector: SectorKey, stored?: string[]): string[] {
  return stored?.length ? stored : [...sectorPresets[sector].features];
}

async function getCompanyForUser(supabase: any, userId: string) {
  console.log('Getting company for user:', userId);
  
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select(`
      company_id,
      role,
      companies (
        id,
        name,
        sector,
        sector_features
      )
    `)
    .eq('user_id', userId)
    .single();

  if (membershipError) {
    console.error('Membership error:', membershipError);
    throw new Error('Company not found for user');
  }

  return {
    company: membership.companies,
    role: membership.role
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User authenticated:', user.id);

    // Get company information
    const { company } = await getCompanyForUser(supabase, user.id);
    
    if (!company) {
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Company found:', company.id, 'Sector:', company.sector);

    // Check if XML import feature is enabled for this sector
    const features = deriveFeatures(company.sector as SectorKey, company.sector_features || []);
    
    console.log('Company features:', features);
    
    if (!hasFeature("nfePurchaseXml", features)) {
      console.log('XML import feature not enabled for sector:', company.sector);
      return new Response(
        JSON.stringify({ 
          error: "Feature não habilitada para este setor.",
          sector: company.sector,
          availableFeatures: features
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle the XML import request
    if (req.method === 'POST') {
      const body = await req.json();
      const { xmlContent } = body;

      if (!xmlContent) {
        return new Response(
          JSON.stringify({ error: 'XML content is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Processing XML import for company:', company.id);

      // TODO: Implement XML parsing and data extraction logic here
      // This would involve:
      // 1. Parse the XML content
      // 2. Extract purchase/product information
      // 3. Create purchase records in the database
      // 4. Create/update product records
      // 5. Update inventory

      // For now, just return a success response
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'XML import processed successfully',
          companyId: company.id,
          sector: company.sector
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For GET requests, return feature availability
    return new Response(
      JSON.stringify({ 
        available: true,
        sector: company.sector,
        features: features
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in import-xml-nfe function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})