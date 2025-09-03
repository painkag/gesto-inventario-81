import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[SALE-RECEIPT] ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get sale ID from URL params
    const url = new URL(req.url)
    const saleId = url.searchParams.get('saleId')
    
    if (!saleId) {
      throw new Error('ID da venda não fornecido')
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData.user) {
      throw new Error('Usuário não autenticado')
    }

    console.log(`[SALE-RECEIPT] User authenticated: ${userData.user.id}`)

    // Get sale data with items and company info
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (name, code, unit)
        ),
        companies (name, document, phone)
      `)
      .eq('id', saleId)
      .single()

    if (saleError || !sale) {
      throw new Error('Venda não encontrada')
    }

    // Verify user has access to this sale
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('company_id')
      .eq('user_id', userData.user.id)
      .eq('company_id', sale.company_id)
      .single()

    if (membershipError || !membership) {
      throw new Error('Acesso negado a esta venda')
    }

    console.log(`[SALE-RECEIPT] Generating receipt for sale: ${sale.sale_number}`)

    // Format data for receipt
    const receiptData = {
      // Company info
      company: {
        name: sale.companies.name,
        document: sale.companies.document || '',
        phone: sale.companies.phone || ''
      },
      
      // Sale info
      sale: {
        number: sale.sale_number,
        date: new Date(sale.created_at).toLocaleDateString('pt-BR'),
        time: new Date(sale.created_at).toLocaleTimeString('pt-BR'),
        customer: sale.customer_name || 'Cliente não identificado',
        notes: sale.notes || ''
      },
      
      // Items
      items: sale.sale_items.map((item: any) => ({
        name: item.products.name,
        code: item.products.code,
        quantity: parseFloat(item.quantity),
        unit: item.products.unit,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      })),
      
      // Totals
      totals: {
        subtotal: parseFloat(sale.subtotal),
        discount: parseFloat(sale.discount_amount || 0),
        total: parseFloat(sale.total_amount)
      }
    }

    // Generate simple text receipt (we can upgrade to PDF later)
    const receiptText = generateReceiptText(receiptData)
    
    console.log(`[SALE-RECEIPT] Receipt generated for sale: ${sale.sale_number}`)

    // Return receipt as downloadable text file
    return new Response(receiptText, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="recibo-${sale.sale_number}.txt"`
      },
      status: 200
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[SALE-RECEIPT] ERROR:', errorMessage)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function generateReceiptText(data: any): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  let receipt = ''
  
  // Header
  receipt += '='.repeat(48) + '\n'
  receipt += `        ${data.company.name.toUpperCase()}\n`
  if (data.company.document) {
    receipt += `           CNPJ: ${data.company.document}\n`
  }
  if (data.company.phone) {
    receipt += `          Tel: ${data.company.phone}\n`
  }
  receipt += '='.repeat(48) + '\n'
  receipt += '\n'
  
  // Sale info
  receipt += `Venda: ${data.sale.number}\n`
  receipt += `Data: ${data.sale.date} ${data.sale.time}\n`
  receipt += `Cliente: ${data.sale.customer}\n`
  receipt += '\n'
  receipt += '-'.repeat(48) + '\n'
  receipt += 'ITEM                    QTD   UNIT   TOTAL\n'
  receipt += '-'.repeat(48) + '\n'
  
  // Items
  for (const item of data.items) {
    const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
    const qty = item.quantity.toString().padStart(5)
    const unit = formatCurrency(item.unit_price).padStart(8)
    const total = formatCurrency(item.total_price).padStart(8)
    
    receipt += `${name.padEnd(20)} ${qty} ${unit} ${total}\n`
  }
  
  receipt += '-'.repeat(48) + '\n'
  
  // Totals
  receipt += `SUBTOTAL:${formatCurrency(data.totals.subtotal).padStart(35)}\n`
  
  if (data.totals.discount > 0) {
    receipt += `DESCONTO:${formatCurrency(data.totals.discount).padStart(35)}\n`
  }
  
  receipt += `TOTAL:${formatCurrency(data.totals.total).padStart(38)}\n`
  receipt += '='.repeat(48) + '\n'
  receipt += '\n'
  
  if (data.sale.notes) {
    receipt += `Observações: ${data.sale.notes}\n`
    receipt += '\n'
  }
  
  receipt += '     Obrigado pela preferência!\n'
  receipt += '='.repeat(48) + '\n'
  
  return receipt
}