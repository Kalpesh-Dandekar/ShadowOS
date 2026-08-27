"use client";

import { BriefcaseBusiness, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/auth-service";

type AuthMode = "login" | "register";

type ValidationDetail = { field?: unknown; message?: unknown };

function registrationPasswordError(password: string) {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  return null;
}

function safeApiErrorMessage(error: ApiError) {
  if (Array.isArray(error.details)) {
    const detail = error.details.find(
      (item): item is ValidationDetail => typeof item === "object" && item !== null && typeof (item as ValidationDetail).message === "string",
    );
    if (detail && typeof detail.message === "string") return detail.message;
  }
  return error.message;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestedRole, setRequestedRole] = useState<"EMPLOYEE" | "MANAGER">("EMPLOYEE");
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    if (isRegister && data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords must match.");
      return;
    }
    const passwordError = isRegister ? registrationPasswordError(password) : null;
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const email = String(data.get("email") || "");
      if (isRegister) {
        await register({ name: String(data.get("fullName") || ""), email, password, requestedRole });
      } else {
        await login({ email, password });
      }
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof ApiError ? safeApiErrorMessage(caught) : "Unable to complete authentication. Please try again.");
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
        {isRegister && <fieldset disabled={submitting}><legend className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Account type</legend><div className="mt-2 grid grid-cols-2 gap-1 rounded-[9px] border border-white/10 bg-[#0d0f12] p-1" role="radiogroup">{([
          { role: "EMPLOYEE" as const, label: "Employee", icon: UserRound },
          { role: "MANAGER" as const, label: "Manager", icon: BriefcaseBusiness },
        ]).map(({ role, label, icon: Icon }) => <button key={role} type="button" role="radio" aria-checked={requestedRole === role} onClick={() => setRequestedRole(role)} className={`flex items-center justify-center gap-2 rounded-[6px] px-3 py-2.5 text-xs font-medium transition-colors ${requestedRole === role ? "bg-white/[0.09] text-white shadow-[inset_0_1px_rgb(255_255_255/0.04)]" : "text-[var(--text-muted)] hover:bg-white/[0.035] hover:text-[var(--text-secondary)]"}`}><Icon size={14} />{label}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-[var(--text-muted)]">{requestedRole === "EMPLOYEE" ? "Submit governed AI operations and monitor your activity." : "Employee access plus review and approval capabilities after administrator approval."}</p>{requestedRole === "MANAGER" && <p className="mt-2 flex items-center gap-2 text-[10px] text-[var(--warning)]"><ShieldCheck size={13} />Manager access requires administrator approval.</p>}</fieldset>}
        {isRegister && <label className="block text-sm text-[var(--text-secondary)]">Full Name<input className={fieldClass} name="fullName" autoComplete="name" placeholder="Kalpesh Dandekar" required minLength={2} /></label>}
        <label className="block text-sm text-[var(--text-secondary)]">Email<input className={fieldClass} name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label>
        <label className="block text-sm text-[var(--text-secondary)]">Password<span className="relative block"><input className={`${fieldClass} pr-11`} name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Enter your password" required minLength={isRegister ? 12 : 1} maxLength={128} disabled={submitting} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute bottom-0 right-0 grid h-[45px] w-11 place-items-center text-[var(--text-muted)] hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{isRegister && <span className="mt-2 block text-[10px] leading-4 text-[var(--text-muted)]">Use 12–128 characters with uppercase, lowercase, number, and special character.</span>}</label>
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
