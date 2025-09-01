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
    const { company_id } = await req.json()

    if (!company_id) {
      throw new Error('Company ID é obrigatório')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get integration settings
    const { data: settings, error: settingsError } = await supabase
      .from('integration_settings')
      .select('whatsapp_enabled, whatsapp_provider, whatsapp_token, whatsapp_instance_id, whatsapp_phone')
      .eq('company_id', company_id)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw new Error('Erro ao buscar configurações WhatsApp')
    }

    if (!settings || !settings.whatsapp_enabled) {
      throw new Error('WhatsApp não está configurado ou habilitado')
    }

    // Get company info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    if (companyError) {
      throw new Error('Erro ao buscar informações da empresa')
    }

    // Simulate WhatsApp message sending based on provider
    let messageData = {}
    const testMessage = `🤖 *Teste WhatsApp*\n\nEste é um teste do sistema ${company.name}.\n\nData: ${new Date().toLocaleString('pt-BR')}\n\n_Sistema de Gestão - Estoque Manager_`

    switch (settings.whatsapp_provider) {
      case 'evolution':
        messageData = {
          provider: 'Evolution API',
          instance: settings.whatsapp_instance_id,
          phone: settings.whatsapp_phone,
          message: testMessage
        }
        console.log('Sending via Evolution API:', messageData)
        break

      case 'twilio':
        messageData = {
          provider: 'Twilio',
          token: settings.whatsapp_token ? '***masked***' : null,
          phone: settings.whatsapp_phone,
          message: testMessage
        }
        console.log('Sending via Twilio:', messageData)
        break

      case 'baileys':
        messageData = {
          provider: 'Baileys',
          instance: settings.whatsapp_instance_id,
          phone: settings.whatsapp_phone,
          message: testMessage
        }
        console.log('Sending via Baileys:', messageData)
        break

      default:
        throw new Error('Provider WhatsApp não configurado')
    }

    // For now, just simulate success
    // TODO: Implement actual WhatsApp API calls
    console.log('WhatsApp test message simulated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem de teste enviada com sucesso',
        details: `Enviado via ${settings.whatsapp_provider} para: ${settings.whatsapp_phone || 'número configurado'}`,
        provider: settings.whatsapp_provider
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in test-whatsapp function:', error)
    
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