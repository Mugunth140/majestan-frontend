"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { seoApi } from "../seo-admin-shell";
export default function SeoLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  return (
    <section className="seo-login" aria-labelledby="login-heading">
      <header className="seo-login-brand">
        <img src="/assets/images/logo/logo.png" alt="Majestan Realty" />
      </header>
      <div className="seo-login-heading">
        <h1 id="login-heading">Admin Panel</h1>
        <p>Sign in to manage your website.</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const data = new FormData(e.currentTarget);
          try {
            await seoApi("auth/login", {
              email: data.get("email"),
              password: data.get("password"),
            });
            router.replace("/admin/projects/seo");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        aria-busy={busy}
      >
        <div className="seo-login-field">
          <label htmlFor="login-email">Email address</label>
          <div className="seo-login-input">
            <Mail size={16} aria-hidden="true" />
            <input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@company.com" disabled={busy} required />
          </div>
        </div>
        <div className="seo-login-field">
          <label htmlFor="login-password">Password</label>
          <div className="seo-login-input">
            <LockKeyhole size={16} aria-hidden="true" />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={6}
            disabled={busy}
            required
          />
            <button type="button" className="seo-login-reveal" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={busy}>
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="seo-error">
            {error}
          </p>
        )}
        <button type="submit" className="seo-button seo-login-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          {busy ? <LoaderCircle size={16} className="seo-login-spinner" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>
      <footer className="seo-login-footer">
        <a href="/" target="_blank" rel="noreferrer">View website <ArrowUpRight size={14} aria-hidden="true" /></a>
      </footer>
    </section>
  );
}
