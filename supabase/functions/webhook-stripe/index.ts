import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    logStep("Webhook received")

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe keys not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })

    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No stripe signature provided')
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      logStep(`Event verified: ${event.type}`)
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message })
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Check idempotency
    const { data: existingEvent } = await supabase
      .from("processed_events")
      .select("event_id")
      .eq("event_id", event.id)
      .single();

    if (existingEvent) {
      logStep(`Event ${event.id} already processed, skipping`);
      return new Response("Event already processed", { status: 200 });
    }

    // Register event
    await supabase
      .from("processed_events")
      .insert({
        event_id: event.id,
        event_type: event.type,
        event_created_at: new Date(event.created * 1000).toISOString(),
        processed: false
      });

    // Process webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        logStep("Processing checkout.session.completed", { sessionId: session.id })
        
        const companyId = session.metadata?.company_id
        const plan = session.metadata?.plan
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        
        if (!companyId) {
          logStep("No company_id in session metadata")
          break
        }

        // Get subscription details including price
        let priceId = null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          priceId = subscription.items.data[0]?.price.id;
        }

        // Update company with Stripe data
        await supabase
          .from('companies')
          .update({
            plan: plan,
            is_blocked: false,
            ai_enabled: plan === 'professional',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id_current: priceId,
            subscription_status: 'ACTIVE',
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId)

        // Create or update subscription record
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          await supabase
            .from('subscriptions')
            .upsert({
              company_id: companyId,
              plan: plan,
              status: 'ACTIVE',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              ai_included: plan === 'professional',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'company_id'
            })
        }

        logStep("Checkout completed successfully", { companyId, plan })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id })
        
        const customerId = invoice.customer as string;
        
        // Find company by stripe_customer_id
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (company && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const plan = subscription.metadata?.plan
          
          // Unblock company and update status
          await supabase
            .from('companies')
            .update({
              is_blocked: false,
              ai_enabled: plan === 'professional',
              subscription_status: 'ACTIVE',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id)

          await supabase
            .from('subscriptions')
            .upsert({
              company_id: company.id,
              plan: plan,
              status: 'ACTIVE',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              ai_included: plan === 'professional',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'company_id'
            })

          logStep("Payment succeeded - company unblocked", { companyId: company.id })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id })
        
        const customerId = invoice.customer as string;
        
        // Find company by stripe_customer_id
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (company) {
          // Block company due to failed payment
          await supabase
            .from('companies')
            .update({
              is_blocked: true,
              subscription_status: 'PAST_DUE',
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id)

          await supabase
            .from('subscriptions')
            .update({
              status: 'PAST_DUE',
              updated_at: new Date().toISOString()
            })
            .eq('company_id', company.id)

          logStep("Payment failed - company blocked", { companyId: company.id })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        logStep(`Processing ${event.type}`, { subscriptionId: subscription.id })
        
        const customerId = subscription.customer as string;
        const plan = subscription.metadata?.plan
        const status = subscription.status.toUpperCase();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const priceId = subscription.items.data[0]?.price.id;
        
        // Find company by stripe_customer_id
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (company) {
          // Update subscription
          await supabase
            .from('subscriptions')
            .upsert({
              company_id: company.id,
              plan: plan,
              status: status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: currentPeriodEnd,
              ai_included: plan === 'professional',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'company_id'
            })

          // Update company status based on subscription status
          const isBlocked = !['ACTIVE', 'TRIALING'].includes(status)
          await supabase
            .from('companies')
            .update({
              is_blocked: isBlocked,
              ai_enabled: plan === 'professional' && !isBlocked,
              stripe_subscription_id: subscription.id,
              stripe_price_id_current: priceId,
              subscription_status: status,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id)

          logStep(`Subscription ${event.type.split('.')[2]} processed`, { 
            companyId: company.id, 
            status: status,
            isBlocked 
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id })
        
        const customerId = subscription.customer as string;
        
        // Find company by stripe_customer_id
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (company) {
          // Block company and update subscription status
          await supabase
            .from('companies')
            .update({
              is_blocked: true,
              ai_enabled: false,
              subscription_status: 'CANCELED',
              stripe_subscription_id: null,
              stripe_price_id_current: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id)

          await supabase
            .from('subscriptions')
            .update({
              status: 'CANCELED',
              updated_at: new Date().toISOString()
            })
            .eq('company_id', company.id)

          logStep("Subscription canceled - company blocked", { companyId: company.id })
        }
        break
      }

      default:
        logStep(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await supabase
      .from("processed_events")
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq("event_id", event.id);

    logStep(`Successfully processed ${event.type} event: ${event.id}`)
    return new Response('OK', { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep("ERROR in webhook", { message: errorMessage })
    
    return new Response('Webhook handler failed', { status: 500 })
  }
})