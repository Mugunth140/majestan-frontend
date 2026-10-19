"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { seoApi } from "../seo-admin-shell";
export default function SeoLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <section className="seo-login">
      <img src="/assets/images/logo/logo.png" alt="Majestan Realty" />
      <h1>Admin Panel</h1>
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
      >
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>
        {error && (
          <p role="alert" className="seo-error">
            {error}
          </p>
        )}
        <button className="seo-button" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <a href="/" target="_blank" rel="noreferrer">View website</a>
    </section>
  );
}
