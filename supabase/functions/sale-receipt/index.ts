import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const url = new URL(req.url)
    const saleId = url.searchParams.get('sale_id')

    if (!saleId) {
      throw new Error('Sale ID is required')
    }

    // Get sale data with items
    const { data: sale, error: saleError } = await supabaseClient
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (name, sku),
          batches (batch_number, expiry_date)
        ),
        companies (name, cnpj, address, phone)
      `)
      .eq('id', saleId)
      .eq('user_id', user.id)
      .single()

    if (saleError) {
      throw saleError
    }

    if (!sale) {
      throw new Error('Sale not found')
    }

    // Generate PDF receipt
    const receiptHtml = generateReceiptHtml(sale)
    
    // Convert HTML to PDF using a simple HTML-to-PDF approach
    // In a real implementation, you might want to use a proper PDF library
    const pdfResponse = await fetch('https://htmlpdf.io/api/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('HTMLPDF_API_KEY')}` // You'd need to add this
      },
      body: JSON.stringify({
        html: receiptHtml,
        format: 'A4',
        margin: '20mm'
      })
    })

    if (!pdfResponse.ok) {
      // Fallback: return HTML receipt if PDF generation fails
      return new Response(receiptHtml, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="recibo-${saleId}.html"`
        },
      })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${saleId}.pdf"`
      },
    })

  } catch (error) {
    console.error('Receipt generation error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateReceiptHtml(sale: any): string {
  const company = sale.companies
  const items = sale.sale_items

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Venda #${sale.id}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10px;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .company-name {
          font-weight: bold;
          font-size: 14px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .total-row {
          border-top: 1px dashed #000;
          padding-top: 5px;
          margin-top: 10px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${company?.name || 'Empresa'}</div>
        ${company?.cnpj ? `<div>CNPJ: ${company.cnpj}</div>` : ''}
        ${company?.address ? `<div>${company.address}</div>` : ''}
        ${company?.phone ? `<div>Tel: ${company.phone}</div>` : ''}
      </div>

      <div>
        <strong>CUPOM FISCAL</strong><br>
        Venda #${sale.id}<br>
        Data: ${new Date(sale.created_at).toLocaleString('pt-BR')}<br>
        ${sale.customer_name ? `Cliente: ${sale.customer_name}<br>` : ''}
        Pagamento: ${sale.payment_method}<br>
      </div>

      <div style="margin: 15px 0;">
        ${items.map((item: any) => `
          <div class="item-row">
            <div style="flex: 1;">
              ${item.products?.name || 'Produto'}<br>
              <small>${item.quantity}x ${formatCurrency(item.unit_price)}</small>
              ${item.batches?.batch_number ? `<br><small>Lote: ${item.batches.batch_number}</small>` : ''}
            </div>
            <div style="text-align: right;">
              ${formatCurrency(item.quantity * item.unit_price)}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="total-row">
        <div class="item-row">
          <div>TOTAL:</div>
          <div>${formatCurrency(sale.total)}</div>
        </div>
      </div>

      <div class="footer">
        Obrigado pela preferência!<br>
        Sistema Gesto Inventário
      </div>
    </body>
    </html>
  `
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}