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

    const stripeSecretKey = Deno.env.get('Chave secreta stripe')!
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

    // Process webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        logStep("Processing checkout.session.completed", { sessionId: session.id })
        
        const companyId = session.metadata?.company_id
        const plan = session.metadata?.plan
        
        if (!companyId) {
          logStep("No company_id in session metadata")
          break
        }

        // Update company plan and unblock
        await supabase
          .from('companies')
          .update({
            plan: plan,
            is_blocked: false,
            ai_enabled: plan === 'professional',
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId)

        // Create or update subscription record
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
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
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const companyId = subscription.metadata?.company_id
          const plan = subscription.metadata?.plan
          
          if (companyId) {
            // Unblock company and update subscription
            await supabase
              .from('companies')
              .update({
                is_blocked: false,
                ai_enabled: plan === 'professional',
                updated_at: new Date().toISOString()
              })
              .eq('id', companyId)

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

            logStep("Payment succeeded - company unblocked", { companyId })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id })
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const companyId = subscription.metadata?.company_id
          
          if (companyId) {
            // Block company due to failed payment
            await supabase
              .from('companies')
              .update({
                is_blocked: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', companyId)

            await supabase
              .from('subscriptions')
              .update({
                status: 'PAST_DUE',
                updated_at: new Date().toISOString()
              })
              .eq('company_id', companyId)

            logStep("Payment failed - company blocked", { companyId })
          }
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        logStep(`Processing ${event.type}`, { subscriptionId: subscription.id })
        
        const companyId = subscription.metadata?.company_id
        const plan = subscription.metadata?.plan
        
        if (companyId) {
          await supabase
            .from('subscriptions')
            .upsert({
              company_id: companyId,
              plan: plan,
              status: subscription.status.toUpperCase(),
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              ai_included: plan === 'professional',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'company_id'
            })

          // Update company status based on subscription status
          const isBlocked = !['active', 'trialing'].includes(subscription.status)
          await supabase
            .from('companies')
            .update({
              is_blocked: isBlocked,
              ai_enabled: plan === 'professional' && !isBlocked,
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId)

          logStep(`Subscription ${event.type.split('.')[2]} processed`, { 
            companyId, 
            status: subscription.status,
            isBlocked 
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id })
        
        const companyId = subscription.metadata?.company_id
        
        if (companyId) {
          // Block company and update subscription status
          await supabase
            .from('companies')
            .update({
              is_blocked: true,
              ai_enabled: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId)

          await supabase
            .from('subscriptions')
            .update({
              status: 'CANCELED',
              updated_at: new Date().toISOString()
            })
            .eq('company_id', companyId)

          logStep("Subscription canceled - company blocked", { companyId })
        }
        break
      }

      default:
        logStep(`Unhandled event type: ${event.type}`)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep("ERROR in webhook", { message: errorMessage })
    
    return new Response('Webhook handler failed', { status: 500 })
  }
})