"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "./actions";

export interface ProfileFormValues {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  consentWhatsapp: boolean;
}

const initialState: ProfileState = {};

export function AccountProfileForm({ values }: { values: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="account-form" noValidate>
      <div className="field">
        <label className="auth-label" htmlFor="acc-name">
          Full name
        </label>
        <input
          id="acc-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={values.name}
        />
      </div>

      <div className="field">
        <label className="auth-label" htmlFor="acc-phone">
          Mobile number
        </label>
        <input
          id="acc-phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="10-digit mobile"
          defaultValue={values.phone}
        />
      </div>

      <p className="account-subhead">Saved delivery address</p>

      <div className="field">
        <label className="auth-label" htmlFor="acc-line1">
          Address
        </label>
        <input
          id="acc-line1"
          name="line1"
          autoComplete="address-line1"
          placeholder="House no., street"
          defaultValue={values.line1}
        />
      </div>

      <div className="field">
        <label className="auth-label" htmlFor="acc-line2">
          Address line 2 <span className="checkout-optional">(optional)</span>
        </label>
        <input
          id="acc-line2"
          name="line2"
          autoComplete="address-line2"
          placeholder="Apartment, landmark"
          defaultValue={values.line2}
        />
      </div>

      <div className="checkout-row">
        <div className="field">
          <label className="auth-label" htmlFor="acc-city">
            City
          </label>
          <input
            id="acc-city"
            name="city"
            autoComplete="address-level2"
            defaultValue={values.city}
          />
        </div>
        <div className="field">
          <label className="auth-label" htmlFor="acc-state">
            State
          </label>
          <input
            id="acc-state"
            name="state"
            autoComplete="address-level1"
            defaultValue={values.state}
          />
        </div>
      </div>

      <div className="field checkout-pincode">
        <label className="auth-label" htmlFor="acc-pincode">
          Pincode
        </label>
        <input
          id="acc-pincode"
          name="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="6-digit"
          defaultValue={values.pincode}
        />
      </div>

      <label className="account-consent">
        <input
          type="checkbox"
          name="consentWhatsapp"
          defaultChecked={values.consentWhatsapp}
        />
        <span>
          Send me order updates and offers on WhatsApp. You can opt out anytime.
        </span>
      </label>

      {state.error ? (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="account-saved" role="status">
          Profile saved.
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary account-save"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
