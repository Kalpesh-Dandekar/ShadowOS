"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/auth-service";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (isRegister && data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords must match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const email = String(data.get("email") || "");
      const password = String(data.get("password") || "");
      if (isRegister) {
        await register({ name: String(data.get("fullName") || ""), email, password });
      } else {
        await login({ email, password });
      }
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to complete authentication. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-2 w-full rounded-[8px] border border-white/10 bg-[#0d0f12] px-3.5 py-3 text-sm text-white shadow-[inset_0_1px_rgb(255_255_255/0.02)] placeholder:text-[var(--text-muted)] hover:border-white/20 focus:border-[var(--focus)] focus:outline-none focus:ring-2 focus:ring-[rgb(106_168_255/0.12)]";

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">ShadowOS access</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{isRegister ? "Create your account" : "Welcome back"}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{isRegister ? "Set up access to the governance console." : "Sign in to your governance workspace."}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-[18px]" aria-describedby={error ? "auth-error" : undefined}>
        {isRegister && <label className="block text-sm text-[var(--text-secondary)]">Full Name<input className={fieldClass} name="fullName" autoComplete="name" placeholder="Kalpesh Dandekar" required minLength={2} /></label>}
        <label className="block text-sm text-[var(--text-secondary)]">Email<input className={fieldClass} name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
        <label className="block text-sm text-[var(--text-secondary)]">Password<span className="relative block"><input className={`${fieldClass} pr-11`} name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Enter your password" required minLength={isRegister ? 12 : 1} disabled={submitting} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute bottom-0 right-0 grid h-[45px] w-11 place-items-center text-[var(--text-muted)] hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        {isRegister && <label className="block text-sm text-[var(--text-secondary)]">Confirm Password<input className={fieldClass} name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" required minLength={12} disabled={submitting} /></label>}
        {error && <p id="auth-error" className="text-sm text-[var(--critical)]" role="alert">{error}</p>}
        {isRegister ? <label className="flex items-start gap-3 text-xs leading-5 text-[var(--text-muted)]"><input type="checkbox" required className="mt-1 accent-white" />I agree to the terms and acknowledge the privacy policy.</label> : <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-[var(--text-secondary)]"><input type="checkbox" className="accent-white" />Remember me</label><button type="button" className="text-[var(--text-secondary)] hover:text-white">Forgot password?</button></div>}
        <button type="submit" disabled={submitting} className="w-full rounded-[8px] bg-white px-4 py-3 text-sm font-medium text-black shadow-[0_8px_24px_rgb(255_255_255/0.06)] transition-colors hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-70">{submitting ? (isRegister ? "Creating accountâ€¦" : "Signing inâ€¦") : (isRegister ? "Create Account" : "Sign In")}</button>
        <p className="text-center text-xs text-[var(--text-muted)]">Secure access uses an HttpOnly session cookie.</p>
      </form>
      <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">{isRegister ? "Already have access?" : "New to ShadowOS?"} <Link href={isRegister ? "/login" : "/register"} className="font-medium text-white hover:underline">{isRegister ? "Sign in" : "Register"}</Link></p>
    </>
  );
}
