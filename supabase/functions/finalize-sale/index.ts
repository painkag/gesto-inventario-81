import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  batch_id?: string;
}

interface SaleRequest {
  items: SaleItem[];
  customer_name?: string;
  payment_method: string;
  total: number;
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

    const saleData: SaleRequest = await req.json()

    // Start transaction
    const { data: sale, error: saleError } = await supabaseClient
      .from('sales')
      .insert({
        user_id: user.id,
        customer_name: saleData.customer_name,
        payment_method: saleData.payment_method,
        total: saleData.total,
        status: 'completed'
      })
      .select()
      .single()

    if (saleError) {
      throw saleError
    }

    // Process each item with FEFO (First Expired First Out)
    for (const item of saleData.items) {
      // Insert sale item
      const { error: itemError } = await supabaseClient
        .from('sale_items')
        .insert({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          batch_id: item.batch_id
        })

      if (itemError) {
        throw itemError
      }

      // Update inventory using FEFO logic
      if (item.batch_id) {
        // Update specific batch
        const { error: batchError } = await supabaseClient
          .from('batches')
          .update({
            current_quantity: supabaseClient.raw('current_quantity - ?', [item.quantity])
          })
          .eq('id', item.batch_id)
        
        if (batchError) {
          throw batchError
        }
      } else {
        // Use FEFO function for automatic batch selection
        const { error: fefoError } = await supabaseClient
          .rpc('process_sale_fefo', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_sale_id: sale.id
          })

        if (fefoError) {
          throw fefoError
        }
      }

      // Record stock movement
      const { error: movementError } = await supabaseClient
        .from('stock_movements')
        .insert({
          product_id: item.product_id,
          batch_id: item.batch_id,
          movement_type: 'sale',
          quantity: -item.quantity,
          reference_id: sale.id,
          reference_type: 'sale'
        })

      if (movementError) {
        throw movementError
      }
    }

    // Return success with sale data
    return new Response(
      JSON.stringify({
        success: true,
        sale_id: sale.id,
        receipt_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/sale-receipt?sale_id=${sale.id}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Sale finalization error:', error)
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