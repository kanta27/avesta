"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signInAdmin, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInAdmin,
    initialState,
  );
  // `denied=1` is set by the edge proxy when a signed-in but non-allow-listed
  // account tries to reach the admin area.
  const denied = useSearchParams().get("denied") === "1";

  return (
    <div className="w-full max-w-sm">
      <p className="font-mono text-xs uppercase tracking-widest text-grey">
        Avesta Nordic
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-grey">
        Sign in with your admin email and password.
      </p>

      {denied && (
        <p className="mt-4 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
          That account isn&apos;t authorized for the admin area.
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-3">
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-card border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="sr-only">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-card border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>

        {state.error && <p className="text-sm text-red-700">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full justify-center disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
