"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { requestMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const params = useSearchParams();
  const denied = params.get("denied") === "1";
  const linkError = params.get("error") === "1";

  return (
    <div className="w-full max-w-sm">
      <p className="font-mono text-xs uppercase tracking-widest text-grey">
        Avesta Health
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-grey">
        Enter your email and we&apos;ll send a one-time sign-in link.
      </p>

      {denied && (
        <p className="mt-4 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
          That account isn&apos;t authorized for the admin area.
        </p>
      )}
      {linkError && (
        <p className="mt-4 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
          That sign-in link was invalid or expired. Request a new one.
        </p>
      )}

      {state.status === "sent" ? (
        <p className="mt-6 rounded-card border border-line bg-paper-2 px-4 py-3 text-sm">
          {state.message}
        </p>
      ) : (
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

          {state.status === "error" && (
            <p className="text-sm text-red-700">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full justify-center disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </div>
  );
}
