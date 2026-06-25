import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SectionHead } from "@/components/ui/SectionHead";
import { getCurrentUser } from "@/lib/auth/customer";
import { safeNextPath } from "@/lib/auth/safe-next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Avesta Nordic account.",
  robots: { index: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext, "/account");

  // Already signed in → nothing to create; go where they were headed.
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <section className="auth-section">
      <div className="wrap auth-wrap">
        <SectionHead
          kicker="Account"
          title="Create your account"
          description="One account to check out, track orders, and reorder in a tap."
        />
        <SignupForm next={next} />
      </div>
    </section>
  );
}
