import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin sign in — Avesta Nordic",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-paper text-ink px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
