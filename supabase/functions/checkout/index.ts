import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Function started")

    const { company_id, plan } = await req.json()

    if (!company_id || !plan) {
      throw new Error('company_id e plan são obrigatórios')
    }

    logStep(`Iniciando checkout para empresa ${company_id}, plano: ${plan}`)

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const priceIdNoAi = Deno.env.get('id do produto de 300 reais')!
    const priceIdWithAi = Deno.env.get('id do produto de 500 reais')!

    if (!stripeSecretKey || !priceIdNoAi || !priceIdWithAi) {
      throw new Error('Chaves do Stripe não configuradas')
    }

    logStep("Environment variables verified")

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    logStep("Stripe initialized")

    // Verificar se empresa existe e pegar dados do usuário
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    if (companyError) {
      throw new Error('Empresa não encontrada')
    }

    logStep(`Company found: ${company.name}`)

    // Mapear planos para Price IDs do Stripe
    const planToPriceId = {
      essential: priceIdNoAi,
      professional: priceIdWithAi
    }

    const planConfig = {
      essential: {
        name: "Plano Essencial",
        price: 29900, // R$ 299.00 em centavos
        ai_included: false
      },
      professional: {
        name: "Plano Profissional", 
        price: 50000, // R$ 500.00 em centavos
        ai_included: true
      }
    }

    const selectedPlan = planConfig[plan as keyof typeof planConfig]
    const priceId = planToPriceId[plan as keyof typeof planToPriceId]
    
    if (!selectedPlan || !priceId) {
      throw new Error('Plano inválido')
    }

    logStep(`Plan selected: ${selectedPlan.name} - Price ID: ${priceId}`)

    // Buscar dados do usuário para criar customer no Stripe
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

    // Verificar se já existe customer no Stripe
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    })

    let customerId
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      logStep(`Existing Stripe customer found: ${customerId}`)
    } else {
      // Criar novo customer
      const customer = await stripe.customers.create({
        email: userData.user.email,
        name: company.name,
        metadata: {
          company_id: company_id,
          user_id: userData.user.id
        }
      })
      customerId = customer.id
      logStep(`New Stripe customer created: ${customerId}`)
    }

    // Criar sessão de checkout do Stripe
    const origin = req.headers.get('origin') || 'https://ioebjmpteseatjsbyfxy.supabase.co'
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/plano?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/dashboard/plano?canceled=true`,
      metadata: {
        company_id: company_id,
        plan: plan
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          company_id: company_id,
          plan: plan
        }
      }
    })

    logStep(`Checkout session created: ${session.id}`)
    logStep(`Redirecting to: ${session.url}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        checkout_url: session.url,
        session_id: session.id,
        plan: selectedPlan.name,
        amount: selectedPlan.price / 100 // converter de centavos para reais
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep("ERROR in checkout", { message: errorMessage })
    
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