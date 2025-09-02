import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Function started")

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    logStep("Stripe initialized")

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData.user?.email) {
      throw new Error('Usuário não autenticado ou email não disponível')
    }

    logStep(`User authenticated: ${userData.user.email}`)

    // Find Stripe customer
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    })

    if (customers.data.length === 0) {
      throw new Error('Cliente não encontrado no Stripe')
    }

    const customerId = customers.data[0].id
    logStep(`Stripe customer found: ${customerId}`)

    // Create billing portal session
    const origin = req.headers.get('origin') || 'https://ioebjmpteseatjsbyfxy.supabase.co'
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/plano`,
    })

    logStep(`Portal session created: ${portalSession.id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        portal_url: portalSession.url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep("ERROR in customer portal", { message: errorMessage })
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})