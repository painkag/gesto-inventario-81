import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { name, email, company, phone, message } = await req.json()
    
    // Email configuration (using protected admin email)
    const adminEmail = "victorcamargo9903@gmail.com"
    
    // Send email notification
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@estoquemanager.com.br',
        to: [adminEmail],
        subject: `Novo contato: ${name} - ${company || 'Empresa não informada'}`,
        html: `
          <h2>Novo formulário de contato recebido</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Empresa:</strong> ${company || 'Não informado'}</p>
          <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message}</p>
        `,
      }),
    })

    // Send WhatsApp message
    const whatsappNumber = "5511991541229" // Protected number
    const whatsappMessage = `🎯 *Novo lead - Estoque Manager*\n\n👤 *Nome:* ${name}\n📧 *Email:* ${email}\n🏢 *Empresa:* ${company || 'Não informado'}\n📱 *Telefone:* ${phone || 'Não informado'}\n\n💬 *Mensagem:*\n${message}`
    
    const whatsappResponse = await fetch(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`, {
      method: 'GET',
    })

    console.log('Email sent:', emailResponse.ok)
    console.log('WhatsApp notification prepared for:', whatsappNumber)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso!',
        emailSent: emailResponse.ok 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending contact message:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})