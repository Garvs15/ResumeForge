import { getSubscriptionAccessState } from "@/lib/subscription-access";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// ROUTES AVAILABLE ON THE FREE PLAN
const SUBSCRIPTION_EXEMPT_ROUTES = [
    '/home',
    '/profile',
    '/resumes',
    '/settings',
    '/subscription',
    '/start-trial',
    '/subscription/checkout',
    '/subscription/checkout-return',
    '/auth',
    '/api',
];



function isSubscriptionExemptRoute(pathname: string): boolean {
    return SUBSCRIPTION_EXEMPT_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    );
}

export async function updateSession(request: NextRequest) {
    // Debug logging
    const pathname = request.nextUrl.pathname;
    console.log('Update Session running on:', request.nextUrl.pathname);

    // ✅ BYPASS system/internal routes
if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
}

    let supabaseResponse = NextResponse.next({
        request
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        });

    const { data: { user } } = await supabase.auth.getUser();

    console.log('👤 User authenticated:', !!user, 'user_id:', user?.id);

    const requestHeaders = new Headers(request.headers);

    // Create a new response with enriched headers
    supabaseResponse = NextResponse.next({
        request: {
            ...request,
            headers: requestHeaders,
        }
    });

    supabaseResponse.cookies.set('show-banner', 'false');

    // Check if the user is authenticated and redirect if needed
    if (!user) {
        // Allow access to the public routes without a session
        const isPublicRoute = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/blog');

        if (isPublicRoute) {
            console.log('Allowing authenticated access to public routes:', pathname);
            return supabaseResponse;
        }

        // If the no user is authenticated, redirect to the landing page
        console.log('🚫 Redirecting unauthenticated user to landing page');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Check if the route requires subscription
    const isExempt = isSubscriptionExemptRoute(pathname);

    console.log("🛡️ Route check:", {
        pathname,
        isExempt,
    });

    console.log("👉 Checking route:", pathname, "| Exempt:", isExempt);

    if (!isSubscriptionExemptRoute(pathname)) {
        // Check if the user has an active subscription or trial
        console.log('🧭 Subscription check for path:', pathname);
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('subscription_plan, stripe_subscription_id, subscription_status, current_period_end, trial_end')
            .eq('user_id', user.id)
            .maybeSingle();

        console.log('📦 Subscription record:', {
            stripe_subscription_id: subscription?.stripe_subscription_id,
            subscription_status: subscription?.subscription_status,
            current_period_end: subscription?.current_period_end,
            trial_end: subscription?.trial_end,
        });

        const subscriptionState = getSubscriptionAccessState(subscription);
        const hasProtectedRouteAccess = subscriptionState.hasProAccess;

        console.log('✅ accessCheck:', {
            status: subscription?.subscription_status,
            isTrialing: subscriptionState.isTrialing,
            isWithinAccessWindow: subscriptionState.isWithinAccessWindow,
            hasProtectedRouteAccess,
        });

        if (!hasProtectedRouteAccess) {
            console.log("🚨 BLOCKED ROUTE:", pathname);
            console.log('🚫 User subscription access expired or invalid, redirecting to home')

            const url = request.nextUrl.clone();
            url.pathname = '/home';
            return NextResponse.redirect(url);
        }
    }

    console.log('User Authenticated, allowing access');

    return supabaseResponse;
}