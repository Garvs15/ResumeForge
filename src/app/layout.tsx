import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { AppHeader } from "@/components/layout/app-header";
import { cookies } from "next/headers";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ResumeForge - AI Powered Resume Builder",
    template: "%s | ResumeForge"
  },
  description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
  applicationName: "ResumeForge",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application"],
  authors: [{ name: "ResumeForge" }],
  creator: "ResumeForge",
  publisher: "ResumeForge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.jpg",
    // shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Detect impersonation via cookie set during /admin/impersonate flow
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';

  let showUpgradeButton = false;
  let isProPlan = false;
  let upgradeButtonVariant: 'trial' | 'upgrade' = 'upgrade';
  if (user) {
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('subscription_plan, subscription_status, current_period_end, trial_end, stripe_subscription_end')
        .eq('user_id', user.id)
        .maybeSingle();

      const subscriptionPlan = subscription?.subscription_plan?.toLowerCase() ?? 'free';
      const subscriptionStatus = subscription?.subscription_status ?? null;
      const currentPeriodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
      const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;

      const now = new Date();
      const isTrialing = Boolean(trialEnd && trialEnd > now);
      const hasStripeSubscription = Boolean(subscription?.stripe_subscription_end);
      const isWithinAccessWindow = Boolean(currentPeriodEnd && currentPeriodEnd > now);

      // Treat Trialing + cancel-at-period-end users as Pro until their access window ends.
      const hasManualProAccess = subscriptionPlan === 'pro' && subscriptionStatus === 'active';
      const hasStripeTimeboxedAccess = hasStripeSubscription && isWithinAccessWindow;
      const hasCancelingProAccess = subscriptionPlan === 'pro' && subscriptionStatus === 'canceled' && isWithinAccessWindow;

      const hasProAccess = hasManualProAccess || hasStripeTimeboxedAccess || hasCancelingProAccess || isTrialing;

      const hasEverStartedTrialOrSubscription = hasStripeSubscription;
      const needsTrial = !hasEverStartedTrialOrSubscription;

      isProPlan = hasProAccess;
      showUpgradeButton = !hasProAccess;
      upgradeButtonVariant = needsTrial ? 'trial' : 'upgrade';
    } catch (error) {
      // If there's an error, we'll show the upgrade button by default
      showUpgradeButton = false;
      isProPlan = false;
      upgradeButtonVariant = 'upgrade';
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {isImpersonating && user && (
          <div className="bg-amber-500 text-white text-center text-sm py-2">
            Impersonating&nbsp; <span className="font-semibold">{user.email ?? user.id}</span>.&nbsp;
            <Link href="/stop-impersonation" className="underline font-medium">
              Stop impersonating
            </Link>
          </div>
        )}
        <div className="relative min-h-screen h-screen flex flex-col">
          {user && (
            <AppHeader
              showUpgradeButton={showUpgradeButton}
              isProPlan={isProPlan}
              upgradeButtonVariant={upgradeButtonVariant}
            />
          )}
          {/* Padding for header and footer */}
          <main className="py-14 h-full">
            {children}
            <Analytics />
          </main>
          {user && <Footer />}
        </div>
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              fontSize: "1rem",
              padding: "16px",
              minWidth: "400px",
              maxWidth: "500px",
            }
          }}
        />
      </body>
    </html>
  );
}
