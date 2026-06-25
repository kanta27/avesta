import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SectionHead } from "@/components/ui/SectionHead";
import { getCurrentUser } from "@/lib/auth/customer";
import { safeNextPath } from "@/lib/auth/safe-next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Avesta Nordic account.",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext, "/account");

  // Already signed in → skip the form and go where they were headed.
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <section className="auth-section">
      <div className="wrap auth-wrap">
        <SectionHead
          kicker="Account"
          title="Welcome back"
          description="Sign in to track orders, reorder faster, and check out in one step."
        />
        <LoginForm next={next} />
      </div>
    </section>
  );
}
