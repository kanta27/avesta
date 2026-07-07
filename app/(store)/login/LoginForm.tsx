"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "./actions";

const initialState: AuthState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const signupHref = `/signup?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="field">
        <label className="auth-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label className="auth-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Your password"
        />
      </div>

      {state.error ? (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-brass auth-submit"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="auth-alt">
        New to Avesta Nordic? <Link href={signupHref}>Create an account</Link>
      </p>
    </form>
  );
}
