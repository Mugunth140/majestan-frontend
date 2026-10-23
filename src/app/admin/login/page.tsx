"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  IconButton,
  Callout,
  Text,
} from "@radix-ui/themes";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  TriangleAlert,
} from "lucide-react";
import { seoApi } from "../seo-admin-shell";
export default function SeoLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  return (
    <section className="seo-login" aria-labelledby="login-heading">
      <header className="h-15 flex items-center justify-center p-8">
        <img src="/assets/images/logo/logo.png" alt="Majestan Realty" />
      </header>
      <div className="seo-login-heading pt-5">
        {/* <Heading as="h1" size="6" id="login-heading">
          Welcome back
        </Heading> */}
        <Text as="p" size="2" color="gray">
          Sign in with your account
        </Text>
      </div>
      <form
        aria-busy={busy}
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
          } catch (cause) {
            setError((cause as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="seo-login-field">
          <label htmlFor="login-email">Email address</label>
          <TextField.Root
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            size="3"
            required
            disabled={busy}
          >
            <TextField.Slot>
              <Mail size={18} />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div className="seo-login-field">
          <label htmlFor="login-password">Password</label>
          <TextField.Root
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            size="3"
            minLength={6}
            required
            disabled={busy}
          >
            <TextField.Slot>
              <LockKeyhole size={18} />
            </TextField.Slot>
            <TextField.Slot side="right">
              <IconButton
                type="button"
                variant="ghost"
                color="gray"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={busy}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </div>
        {error && (
          <Callout.Root color="red" role="alert">
            <Callout.Icon>
              <TriangleAlert size={16} />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <Button
          type="submit"
          className="seo-login-submit"
          size="3"
          loading={busy}
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight size={18} />
        </Button>
      </form>
    </section>
  );
}
