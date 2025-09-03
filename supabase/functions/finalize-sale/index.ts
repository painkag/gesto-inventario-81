import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface SaleRequest {
  customer_name?: string;
  discount?: number;
  notes?: string;
  items: SaleItem[];
}

serve(async (req) => {
  console.log(`[FINALIZE-SALE] ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    console.log(`[FINALIZE-SALE] User authenticated: ${userData.user.id}`)

    // Get user's company
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('company_id')
      .eq('user_id', userData.user.id)
      .single()

    if (membershipError || !membership) {
      throw new Error('Usuário não possui empresa associada')
    }

    const companyId = membership.company_id
    console.log(`[FINALIZE-SALE] Company ID: ${companyId}`)

    // Parse request body
    const saleData: SaleRequest = await req.json()
    
    if (!saleData.items || saleData.items.length === 0) {
      throw new Error('Venda deve conter pelo menos um item')
    }

    console.log(`[FINALIZE-SALE] Processing sale with ${saleData.items.length} items`)

    // Start transaction
    const { data: saleNumber, error: saleNumberError } = await supabase
      .rpc('next_sale_number', { comp_id: companyId })

    if (saleNumberError) {
      throw new Error(`Erro ao gerar número da venda: ${saleNumberError.message}`)
    }

    console.log(`[FINALIZE-SALE] Sale number generated: ${saleNumber}`)

    // Calculate totals
    const subtotal = saleData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    )
    const discountAmount = saleData.discount || 0
    const totalAmount = Math.max(0, subtotal - discountAmount)

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        company_id: companyId,
        sale_number: saleNumber,
        customer_name: saleData.customer_name || null,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: saleData.notes || null,
        created_by: userData.user.id,
        status: 'COMPLETED'
      })
      .select()
      .single()

    if (saleError) {
      throw new Error(`Erro ao criar venda: ${saleError.message}`)
    }

    console.log(`[FINALIZE-SALE] Sale created: ${sale.id}`)

    // Process each item with FEFO consumption
    const saleItems = []
    
    for (const item of saleData.items) {
      console.log(`[FINALIZE-SALE] Processing item ${item.product_id}, qty: ${item.quantity}`)

      // Consume stock using FEFO function
      const { data: consumptions, error: consumeError } = await supabase
        .rpc('consume_fefo', {
          p_company: companyId,
          p_product: item.product_id,
          p_qty: item.quantity
        })

      if (consumeError) {
        // Rollback sale if stock consumption fails
        await supabase.from('sales').delete().eq('id', sale.id)
        throw new Error(`Estoque insuficiente para o produto: ${consumeError.message}`)
      }

      console.log(`[FINALIZE-SALE] Stock consumed for product ${item.product_id}:`, consumptions)

      // Create sale item record
      const { data: saleItem, error: saleItemError } = await supabase
        .from('sale_items')
        .insert({
          company_id: companyId,
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })
        .select()
        .single()

      if (saleItemError) {
        console.error(`[FINALIZE-SALE] Error creating sale item:`, saleItemError)
        throw new Error(`Erro ao criar item da venda: ${saleItemError.message}`)
      }

      saleItems.push(saleItem)
    }

    console.log(`[FINALIZE-SALE] Sale finalized successfully: ${sale.sale_number}`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        sale: {
          id: sale.id,
          sale_number: sale.sale_number,
          total_amount: sale.total_amount,
          created_at: sale.created_at
        },
        items_count: saleItems.length,
        message: 'Venda finalizada com sucesso!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[FINALIZE-SALE] ERROR:', errorMessage)
    
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