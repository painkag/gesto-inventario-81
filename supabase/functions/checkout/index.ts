import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { company_id, plan } = await req.json()

    if (!company_id || !plan) {
      throw new Error('company_id e plan são obrigatórios')
    }

    console.log(`[CHECKOUT] Iniciando checkout para empresa ${company_id}, plano: ${plan}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se empresa existe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    if (companyError) {
      throw new Error('Empresa não encontrada')
    }

    // Definir valores do plano
    const planConfig = {
      essential: {
        name: "Plano Essencial",
        price: 299,
        ai_included: false
      },
      professional: {
        name: "Plano Profissional", 
        price: 500,
        ai_included: true
      }
    }

    const selectedPlan = planConfig[plan as keyof typeof planConfig]
    if (!selectedPlan) {
      throw new Error('Plano inválido')
    }

    console.log(`[CHECKOUT] Plano selecionado: ${selectedPlan.name} - R$ ${selectedPlan.price}`)

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Criar checkout session mock
    const checkoutSession = {
      id: `mock_checkout_${Date.now()}`,
      company_id,
      plan,
      amount: selectedPlan.price,
      created_at: new Date().toISOString()
    }

    // Criar URL de checkout simulada (redireciona para página de processamento)
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const checkoutUrl = `${origin}/checkout-processing?session_id=${checkoutSession.id}&plan=${plan}&amount=${selectedPlan.price}`

    console.log(`[CHECKOUT] Session criada: ${checkoutSession.id}`)
    console.log(`[CHECKOUT] Redirecionando para: ${checkoutUrl}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        checkout_url: checkoutUrl,
        session_id: checkoutSession.id,
        plan: selectedPlan.name,
        amount: selectedPlan.price
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in checkout function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})