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
    const { type, company_id, plan } = await req.json()

    if (!type || !company_id) {
      throw new Error('type e company_id são obrigatórios')
    }

    console.log(`[WEBHOOK-MOCK] Evento recebido: ${type} para empresa ${company_id}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Processar evento baseado no tipo
    let updateData: any = {}
    let companyUpdateData: any = {}

    switch (type) {
      case 'invoice.paid':
        console.log(`[WEBHOOK-MOCK] Processando pagamento aprovado para plano: ${plan}`)
        
        const aiIncluded = plan === 'professional'
        const currentPeriodEnd = new Date()
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30) // 30 dias a partir de hoje

        updateData = {
          status: 'ACTIVE',
          plan: plan || 'essential',
          ai_included: aiIncluded,
          current_period_start: new Date().toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString()
        }

        companyUpdateData = {
          is_blocked: false
        }

        break

      case 'invoice.payment_failed':
        console.log(`[WEBHOOK-MOCK] Processando falha no pagamento`)
        
        updateData = {
          status: 'PAST_DUE',
          updated_at: new Date().toISOString()
        }

        companyUpdateData = {
          is_blocked: true
        }

        break

      case 'subscription.canceled':
        console.log(`[WEBHOOK-MOCK] Processando cancelamento da assinatura`)
        
        updateData = {
          status: 'CANCELED',
          ai_included: false,
          updated_at: new Date().toISOString()
        }

        companyUpdateData = {
          is_blocked: true
        }

        break

      default:
        throw new Error(`Tipo de evento não suportado: ${type}`)
    }

    // Atualizar ou criar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        company_id,
        ...updateData
      }, { 
        onConflict: 'company_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (subError) {
      console.error('Erro ao atualizar assinatura:', subError)
      throw new Error('Erro ao atualizar assinatura: ' + subError.message)
    }

    // Atualizar status de bloqueio da empresa
    const { error: companyError } = await supabase
      .from('companies')
      .update(companyUpdateData)
      .eq('id', company_id)

    if (companyError) {
      console.error('Erro ao atualizar empresa:', companyError)
      throw new Error('Erro ao atualizar empresa: ' + companyError.message)
    }

    console.log(`[WEBHOOK-MOCK] Evento processado com sucesso:`, {
      type,
      company_id,
      subscription_status: updateData.status,
      is_blocked: companyUpdateData.is_blocked,
      ai_included: updateData.ai_included
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processado com sucesso',
        event: {
          type,
          company_id,
          status: updateData.status,
          ai_included: updateData.ai_included,
          is_blocked: companyUpdateData.is_blocked
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in webhook-mock function:', error)
    
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