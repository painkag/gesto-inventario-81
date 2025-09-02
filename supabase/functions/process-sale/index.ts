import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface SaleRequest {
  companyId: string;
  items: SaleItem[];
  payment: {
    method: 'CASH' | 'CARD' | 'PIX';
    discountPct?: number;
  };
  customerName?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the current user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body: SaleRequest = await req.json();
    const { companyId, items, payment, customerName, notes } = body;

    if (!companyId || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: companyId and items are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing sale for company:', companyId, 'with', items.length, 'items');

    // Verify user has access to the company
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied: user not associated with company' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate total
    const subtotal = items.reduce((acc, item) => 
      acc + (Number(item.unitPrice) * Number(item.quantity)), 0
    );
    
    const discountAmount = payment.discountPct ? (subtotal * payment.discountPct / 100) : 0;
    const total = subtotal - discountAmount;

    console.log('Sale totals - Subtotal:', subtotal, 'Discount:', discountAmount, 'Total:', total);

    // Get next sale number
    const { data: saleNumber, error: numberError } = await supabase
      .rpc('next_sale_number', { comp_id: companyId });

    if (numberError) {
      console.error('Error getting sale number:', numberError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate sale number' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        company_id: companyId,
        sale_number: saleNumber,
        customer_name: customerName || null,
        subtotal: subtotal,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: payment.method,
        status: 'COMPLETED',
        notes: notes || null,
        created_by: user.id
      })
      .select('id, sale_number')
      .single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      return new Response(
        JSON.stringify({ error: 'Failed to create sale: ' + saleError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Sale created:', sale.id, sale.sale_number);

    // Process each item with FEFO consumption
    const processedItems = [];
    
    for (const item of items) {
      try {
        console.log('Processing item:', item.productId, 'quantity:', item.quantity);

        // Create sale item record
        const { data: saleItem, error: itemError } = await supabase
          .from('sale_items')
          .insert({
            company_id: companyId,
            sale_id: sale.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice
          })
          .select('id')
          .single();

        if (itemError) {
          console.error('Error creating sale item:', itemError);
          throw new Error(`Failed to create sale item: ${itemError.message}`);
        }

        // Consume inventory using FEFO
        const { data: fefoResult, error: fefoError } = await supabase
          .rpc('consume_fefo', {
            p_company: companyId,
            p_product: item.productId,
            p_qty: item.quantity
          });

        if (fefoError) {
          console.error('FEFO consumption error:', fefoError);
          throw new Error(`Inventory error: ${fefoError.message}`);
        }

        console.log('FEFO consumption successful for product:', item.productId);
        processedItems.push({
          saleItemId: saleItem.id,
          productId: item.productId,
          quantity: item.quantity,
          fefoResult
        });

      } catch (error) {
        console.error('Error processing item:', item.productId, error);
        
        // Rollback: Delete the sale if any item fails
        await supabase.from('sales').delete().eq('id', sale.id);
        
        return new Response(
          JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Failed to process sale item',
            item: item.productId
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log('All items processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        saleId: sale.id, 
        saleNumber: sale.sale_number,
        total: total,
        itemsProcessed: processedItems.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-sale function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})