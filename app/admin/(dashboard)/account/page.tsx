import { requireAdmin } from "@/lib/auth/require-admin";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata = {
  title: "Account — Avesta Nordic",
};

/**
 * Admin account/profile page. Shows the signed-in admin's email and lets them
 * change their password. `requireAdmin()` gates the page (and the action gates
 * itself again). Authorization for the admin area remains the email allow-list
 * (`ADMIN_ALLOWED_EMAILS`); this page does not change who is an admin.
 */
export default async function AdminAccountPage() {
  const user = await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Your account</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Profile</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-ink">{user.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-ink">Administrator</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-muted">
          Set a new password for signing in to the admin area.
        </p>
        <ChangePasswordForm />
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <form action="/admin/auth/signout" method="post">
          <button
            type="submit"
            className="font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
