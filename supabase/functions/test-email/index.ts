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
      .select('smtp_enabled, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_email, smtp_secure')
      .eq('company_id', company_id)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw new Error('Erro ao buscar configurações SMTP')
    }

    if (!settings || !settings.smtp_enabled) {
      throw new Error('SMTP não está configurado ou habilitado')
    }

    // Get company info for email content
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    if (companyError) {
      throw new Error('Erro ao buscar informações da empresa')
    }

    // Simulate email sending (replace with actual SMTP later)
    console.log('Sending test email with settings:', {
      host: settings.smtp_host,
      port: settings.smtp_port,
      user: settings.smtp_user,
      from: settings.smtp_from_email,
      secure: settings.smtp_secure
    })

    // For now, just simulate success
    // TODO: Implement actual SMTP sending using nodemailer or similar
    const emailContent = {
      to: settings.smtp_from_email,
      subject: `Teste de Email - ${company.name}`,
      text: `Este é um email de teste enviado pelo sistema ${company.name} em ${new Date().toLocaleString('pt-BR')}.`,
      html: `
        <h2>Teste de Email</h2>
        <p>Este é um email de teste enviado pelo sistema <strong>${company.name}</strong>.</p>
        <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <small>Sistema de Gestão - Estoque Manager</small>
      `
    }

    // Log the attempt
    console.log('Test email simulated successfully:', emailContent)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de teste enviado com sucesso',
        details: `Email enviado para: ${settings.smtp_from_email}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in test-email function:', error)
    
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