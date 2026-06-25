"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import type { AuthState } from "../login/actions";

const initialState: AuthState = {};

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );
  const loginHref = `/login?next=${encodeURIComponent(next)}`;

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="field">
        <label className="auth-label" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
        />
      </div>

      <div className="field">
        <label className="auth-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label className="auth-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </div>

      {state.error ? (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-lime auth-submit"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="auth-alt">
        Already have an account? <Link href={loginHref}>Sign in</Link>
      </p>
    </form>
  );
}
