"use client";

import { useActionState } from "react";
import {
  changeAdminPasswordAction,
  type PasswordState,
} from "./actions";

const initialState: PasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changeAdminPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 max-w-sm space-y-3">
      <label className="block">
        <span className="text-sm font-medium">New password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1 w-full rounded-card border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </label>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-ink">Password updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary justify-center disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
