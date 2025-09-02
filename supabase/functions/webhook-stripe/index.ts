// supabase/functions/webhook-stripe/index.ts
import Stripe from "https://esm.sh/stripe@15.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // precisa ignorar RLS
);

const PRICE_PRO = Deno.env.get("STRIPE_PRICE_ID_PRO") ?? ""; // opcional p/ aiEnabled

type Status = "PENDING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE";

function mapStripeStatus(s: string): Status {
  switch (s) {
    case "active": return "ACTIVE";
    case "trialing": return "ACTIVE"; // trate na UI como trial se quiser
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELED";
    case "incomplete":
    case "incomplete_expired": return "PENDING";
    default: return "INACTIVE";
  }
}

async function markEventReceived(event: Stripe.Event) {
  const { error } = await supabase
    .from("processed_events")
    .upsert({ event_id: event.id, event_type: event.type }, { onConflict: "event_id" });
  return !error;
}

async function markEventProcessed(eventId: string, ok: boolean, errMsg?: string) {
  await supabase
    .from("processed_events")
    .update({ processed: ok, processed_at: new Date().toISOString(), last_error: errMsg ?? null })
    .eq("event_id", eventId);
}

Deno.serve(async (req) => {
  console.log(`[WEBHOOK] ${req.method} ${req.url}`);
  
  // 1) Verificação da assinatura (raw body)
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  
  console.log(`[WEBHOOK] Signature: ${sig ? 'present' : 'missing'}`);
  console.log(`[WEBHOOK] Body length: ${raw.length}`);
  
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
    console.log(`[WEBHOOK] Event verified: ${event.type} (${event.id})`);
  } catch (e: any) {
    console.error(`[WEBHOOK] Verification failed: ${e.message}`);
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  // 2) Idempotência
  const receivedOk = await markEventReceived(event);
  if (!receivedOk) {
    console.log(`[WEBHOOK] Event ${event.id} already processed, skipping`);
    return new Response("ok", { status: 200 });
  }

  try {
    console.log(`[WEBHOOK] Processing event: ${event.type}`);
    
    // 3) Roteamento por evento
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const companyId = s.metadata?.companyId; // PRECISA vir do checkout
        const priceId = (s.metadata?.priceId || "") as string;
        const productId = (s.metadata?.productId || "") as string;
        const customerId = s.customer?.toString() ?? null;
        const subscriptionId = s.subscription?.toString() ?? null;

        console.log(`[WEBHOOK] Checkout completed - Company: ${companyId}, Customer: ${customerId}`);

        if (!companyId || !customerId) {
          console.error(`[WEBHOOK] Missing required data - companyId: ${companyId}, customerId: ${customerId}`);
          break;
        }

        // status inicial pendente até confirmar assinatura/fatura
        const { error } = await supabase.from("companies")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id_current: priceId || null,
            stripe_product_id_current: productId || null,
            subscription_status: "PENDING",
          })
          .eq("id", companyId);
          
        if (error) {
          console.error(`[WEBHOOK] Error updating company ${companyId}:`, error);
        } else {
          console.log(`[WEBHOOK] Company ${companyId} updated to PENDING`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status: Status = mapStripeStatus(sub.status);
        const customerId = sub.customer?.toString() ?? "";
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        const priceId = (sub.items?.data?.[0]?.price?.id ?? "") as string;
        const productId = (sub.items?.data?.[0]?.price?.product?.toString() ?? "") as string;

        const aiEnabled = PRICE_PRO ? priceId === PRICE_PRO : null;

        console.log(`[WEBHOOK] Subscription ${event.type} - Customer: ${customerId}, Status: ${status}`);

        const { error } = await supabase.from("companies")
          .update({
            subscription_status: status,
            current_period_end: currentPeriodEnd,
            stripe_price_id_current: priceId || null,
            stripe_product_id_current: productId || null,
            ai_enabled: aiEnabled ?? undefined,
            stripe_subscription_id: sub.id,
          })
          .eq("stripe_customer_id", customerId);
          
        if (error) {
          console.error(`[WEBHOOK] Error updating subscription for customer ${customerId}:`, error);
        } else {
          console.log(`[WEBHOOK] Subscription updated for customer ${customerId} to ${status}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer?.toString() ?? "";
        const periodEnd = inv.lines?.data?.[0]?.period?.end;
        const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

        console.log(`[WEBHOOK] Payment succeeded - Customer: ${customerId}`);

        const { error } = await supabase.from("companies")
          .update({
            subscription_status: "ACTIVE",
            current_period_end: currentPeriodEnd,
          })
          .eq("stripe_customer_id", customerId);
          
        if (error) {
          console.error(`[WEBHOOK] Error updating payment success for customer ${customerId}:`, error);
        } else {
          console.log(`[WEBHOOK] Payment success updated for customer ${customerId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer?.toString() ?? "";
        
        console.log(`[WEBHOOK] Payment failed - Customer: ${customerId}`);
        
        const { error } = await supabase.from("companies")
          .update({ subscription_status: "PAST_DUE" })
          .eq("stripe_customer_id", customerId);
          
        if (error) {
          console.error(`[WEBHOOK] Error updating payment failure for customer ${customerId}:`, error);
        } else {
          console.log(`[WEBHOOK] Payment failure updated for customer ${customerId}`);
        }
        break;
      }
      
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    await markEventProcessed(event.id, true);
    console.log(`[WEBHOOK] Event ${event.id} processed successfully`);
  } catch (e: any) {
    console.error(`[WEBHOOK] Processing error for event ${event.id}:`, e.message);
    await markEventProcessed(event.id, false, e.message);
    return new Response("error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});