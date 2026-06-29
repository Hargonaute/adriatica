import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your sign-in credentials.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-1">Change password</h2>
        <p className="text-xs text-muted-foreground mb-5">
          You&apos;ll stay signed in on this device. Other sessions will be revoked.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
