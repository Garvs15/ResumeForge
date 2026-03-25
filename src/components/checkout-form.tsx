"use client";

import { postStripeSession } from "@/app/(dashboard)/subscription/stripe-session";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

export function CheckOutForm() {
    const searchParams = useSearchParams();
    const priceId = searchParams.get('price_id')!;
    const includeTrial = searchParams.get('trial') === 'true';

    const fetchClientSecret = useCallback(async () => {
        const stripeResponse = await postStripeSession({ priceId, includeTrial });
        console.log(stripeResponse, 'stripeResponsestripeResponse')
        return stripeResponse.clientSecret;
    }, [priceId, includeTrial]);

    React.useEffect(() => {
        async function checkStatuses() {
            try {
                await Promise.all([
                    // DELETE THIS BLOCK
                ]);
            } finally {
                // Empty finally block can remain 
            }
        }

        checkStatuses();
    }, []);

    const options = { fetchClientSecret };

    return (
        <div className="space-y-8">
            <div id="checkout">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>
        </div>
    );
}