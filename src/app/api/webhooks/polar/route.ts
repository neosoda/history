/**
 * Simplified Webhook Handler using Customer State pattern
 * Following POLAR_BILLING_SYSTEM_REDESIGN_V2.md specification
 * Reduced from 272 lines to ~50 lines
 */

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();

    // Convert Next.js headers to plain object that Polar SDK expects
    const headersObj: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    // Skip signature verification in development if configured
    const skipVerification = process.env.NEXT_PUBLIC_APP_MODE === 'development' 
      && process.env.POLAR_SKIP_WEBHOOK_VERIFICATION === 'true';

    let event;
    
    if (!skipVerification) {
      if (!process.env.POLAR_WEBHOOK_SECRET) {
        return new Response('Webhook secret not configured', { status: 500 });
      }

      try {
        event = validateEvent(body, headersObj, process.env.POLAR_WEBHOOK_SECRET);
      } catch (error) {
        if (error instanceof WebhookVerificationError) {
          return new Response('Invalid signature', { status: 403 });
        }
        return new Response('Webhook validation failed', { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    // Initialize Supabase service client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle customer state changes (primary webhook pattern)
    if (event.type === 'customer.state_changed' && event.data.externalId) {
      const { externalId, subscriptions, id: customerId } = event.data;
      
      // Find active subscription (includes trialing status)
      const activeStatuses = ['active', 'trialing'];
      const activeSubscription = subscriptions?.find((s: any) => activeStatuses.includes(s.status));

      let tier = 'free';
      let status = 'inactive';
      let subscriptionId = null;

      if (activeSubscription) {
        // Determine tier from product ID
        if (activeSubscription.productId === process.env.POLAR_SUBSCRIPTION_PRODUCT_ID) {
          tier = 'unlimited'; // $20/month for 100 queries
        } else if (activeSubscription.productId === process.env.POLAR_PAY_PER_USE_PRODUCT_ID) {
          tier = 'pay_per_use'; // $0.25 per deep research run
        } else {
          tier = 'pay_per_use'; // Default to pay-per-use for unknown product IDs
        }
        status = 'active';
        subscriptionId = activeSubscription.id;
      }
      
      // Update subscription fields including Polar IDs
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription_tier: tier,
          subscription_status: status,
          polar_customer_id: customerId,
          subscription_id: subscriptionId
        })
        .eq('id', externalId);

      if (error) {
        return new Response('Database update failed', { status: 500 });
      }
    }

    // Handle legacy events during migration
    if (event.type === 'subscription.created' || event.type === 'subscription.updated' || event.type === 'subscription.active') {
      const subscription = event.data;

      const externalId = subscription.customer?.external_id ||
                        subscription.customer?.externalId ||
                        subscription.externalCustomerId ||
                        subscription.metadata?.userId;

      const productId = subscription.product_id ||
                       subscription.productId ||
                       subscription.product?.id;

      if (externalId) {
        const activeStatuses = ['active', 'trialing'];
        const isCancelled = !activeStatuses.includes(subscription.status) || subscription.cancelAtPeriodEnd === true;

        if (isCancelled) {
          const { error } = await supabase
            .from('users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'inactive',
              subscription_id: null
            })
            .eq('id', externalId);

          if (error) {
            return new Response('Database update failed', { status: 500 });
          }
        } else {
          let tier = 'pay_per_use';
          if (productId === process.env.POLAR_SUBSCRIPTION_PRODUCT_ID) {
            tier = 'unlimited';
          } else if (productId === process.env.POLAR_PAY_PER_USE_PRODUCT_ID) {
            tier = 'pay_per_use';
          }

          const polarCustomerId = subscription.customer?.id || subscription.customerId;
          const subscriptionId = subscription.id;

          const { error } = await supabase
            .from('users')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
              polar_customer_id: polarCustomerId,
              subscription_id: subscriptionId
            })
            .eq('id', externalId);

          if (error) {
            return new Response('Database update failed', { status: 500 });
          }
        }
      }
    }
    
    if (event.type === 'subscription.canceled') {
      const subscription = event.data;

      const externalId = subscription.customer?.external_id ||
                        subscription.customer?.externalId ||
                        subscription.metadata?.userId;

      if (externalId) {
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            subscription_id: null
          })
          .eq('id', externalId);

        if (error) {
          return new Response('Database update failed', { status: 500 });
        }
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}