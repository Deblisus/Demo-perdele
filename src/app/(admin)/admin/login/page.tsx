import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/session";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  if (await isAuthenticated()) {
    redirect(from && from.startsWith("/admin") ? from : "/admin");
  }

  const configured = isAdminConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[26rem]">
        <div className="flex items-baseline gap-2.5">
          <span className="text-base font-semibold tracking-tight">
            PERDELE
          </span>
          <span className="readout">Admin</span>
        </div>

        <hr className="my-5 border-0 border-t border-[var(--rule)]" />

        <h1 className="text-[0.9375rem] font-medium">Sign in</h1>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          This panel manages live orders, stock and payouts. Sessions last eight
          hours.
        </p>

        <div className="mt-6">
          {configured ? (
            <LoginForm
              redirectTo={from && from.startsWith("/admin") ? from : "/admin"}
            />
          ) : (
            <div className="rounded-md border border-[var(--st-warn)]/40 bg-[var(--st-warn-tint)] p-3.5">
              <p className="readout text-[var(--st-warn-ink)]">
                Not configured
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--st-warn-ink)]">
                Set <code className="machine">ADMIN_PASSWORD</code> in{" "}
                <code className="machine">.env</code> and restart the dev
                server. Optionally set{" "}
                <code className="machine">ADMIN_SESSION_SECRET</code> so
                sessions survive a password change.
              </p>
            </div>
          )}
        </div>

        <hr className="mt-8 border-0 border-t border-[var(--rule)]" />
        <p className="readout mt-3">Single shared password · v1</p>
      </div>
    </div>
  );
}
