"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type AuthMode = "login" | "register";

type AuthPageProps = {
  mode: AuthMode;
};

type AuthResponse = {
  success?: boolean;
  data?: {
    accessToken: string;
    user: {
      id: number;
      name?: string;
      email?: string;
      username?: string;
      role: string;
    };
  };
  message?: string | string[];
};

const getErrorMessage = (message: AuthResponse["message"]) => {
  if (Array.isArray(message)) {
    return message[0] ?? "Please check your details and try again.";
  }

  return message ?? "Please check your details and try again.";
};

export function AuthPage({ mode }: AuthPageProps): React.JSX.Element {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isRegister ? "/auth/users/register" : "/auth/users/login";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? { name, email, phone, password }
            : { email, password },
        ),
      });
      const payload = (await response.json()) as AuthResponse;

      if (!response.ok || !payload.data?.accessToken) {
        throw new Error(getErrorMessage(payload.message));
      }

      window.localStorage.setItem("majestan_access_token", payload.data.accessToken);
      window.localStorage.setItem("majestan_user", JSON.stringify(payload.data.user));
      router.push("/");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb] bg-[linear-gradient(135deg,rgba(39,66,127,0.08),rgba(255,201,0,0.08))] px-5 pt-[132px] pb-[72px] max-[640px]:px-3 max-[640px]:pt-[104px] max-[640px]:pb-[54px]">
      <section className="mx-auto !grid max-w-[1120px] grid-cols-[minmax(0,520px)_minmax(320px,1fr)] gap-7 max-[900px]:grid-cols-1">
        <div className="rounded-[28px] border border-[#27427f]/10 bg-white !p-9 shadow-[0_24px_70px_rgba(22,30,45,0.12)] max-[640px]:rounded-[22px] max-[640px]:!p-6">
          <div className="mb-[18px] !flex h-12 w-12 !items-center !justify-center rounded-full bg-[#27427f] text-[#ffc900]">
            <UserRound size={22} />
          </div>
          <p className="mb-2 !text-[12px] font-black tracking-[0.12em] text-[#27427f]/55 uppercase">Majestan Account</p>
          <h1 className="m-0 font-['Lexend',sans-serif] text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.08] tracking-normal text-[#27427f]">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-3.5 mb-7 !text-[15px] leading-[1.7] text-[#5c5e61]">
            {isRegister
              ? "Save shortlisted properties, submit enquiries faster, and keep your real estate journey in one place."
              : "Access your saved properties and continue your real estate journey with Majestan Realty."}
          </p>

          <form className="!grid gap-4" onSubmit={handleSubmit}>
            {isRegister ? (
              <label className="!grid gap-2">
                <span className="!text-[13px] font-extrabold text-[#27427f]">Name</span>
                <span className="!flex !items-center gap-3 rounded-[14px] border border-[#27427f]/10 bg-[#f7f8fb] px-3.5 text-[#27427f]/70 transition-all focus-within:border-[#27427f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]">
                  <UserRound size={18} />
                  <input
                    className="h-[52px] w-full border-0 bg-transparent !text-[15px] text-[#161e2d] outline-none placeholder:text-[#5c5e61]/70"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    placeholder="Your full name"
                    required
                  />
                </span>
              </label>
            ) : null}

            <label className="!grid gap-2">
              <span className="!text-[13px] font-extrabold text-[#27427f]">Email</span>
              <span className="!flex !items-center gap-3 rounded-[14px] border border-[#27427f]/10 bg-[#f7f8fb] px-3.5 text-[#27427f]/70 transition-all focus-within:border-[#27427f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]">
                <Mail size={18} />
                <input
                  className="h-[52px] w-full border-0 bg-transparent !text-[15px] text-[#161e2d] outline-none placeholder:text-[#5c5e61]/70"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>

            {isRegister ? (
              <label className="!grid gap-2">
                <span className="!text-[13px] font-extrabold text-[#27427f]">Phone</span>
                <span className="!flex !items-center gap-3 rounded-[14px] border border-[#27427f]/10 bg-[#f7f8fb] px-3.5 text-[#27427f]/70 transition-all focus-within:border-[#27427f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]">
                  <Phone size={18} />
                  <input
                    className="h-[52px] w-full border-0 bg-transparent !text-[15px] text-[#161e2d] outline-none placeholder:text-[#5c5e61]/70"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    minLength={7}
                    maxLength={20}
                    placeholder="Mobile number"
                    required
                  />
                </span>
              </label>
            ) : null}

            <label className="!grid gap-2">
              <span className="!text-[13px] font-extrabold text-[#27427f]">Password</span>
              <span className="!flex !items-center gap-3 rounded-[14px] border border-[#27427f]/10 bg-[#f7f8fb] px-3.5 text-[#27427f]/70 transition-all focus-within:border-[#27427f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]">
                <LockKeyhole size={18} />
                <input
                  className="h-[52px] w-full border-0 bg-transparent !text-[15px] text-[#161e2d] outline-none placeholder:text-[#5c5e61]/70"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={isRegister ? 8 : 1}
                  maxLength={128}
                  placeholder="Your password"
                  required
                />
              </span>
            </label>

            {isRegister ? (
              <label className="!grid gap-2">
                <span className="!text-[13px] font-extrabold text-[#27427f]">Confirm password</span>
                <span className="!flex !items-center gap-3 rounded-[14px] border border-[#27427f]/10 bg-[#f7f8fb] px-3.5 text-[#27427f]/70 transition-all focus-within:border-[#27427f]/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]">
                  <LockKeyhole size={18} />
                  <input
                    className="h-[52px] w-full border-0 bg-transparent !text-[15px] text-[#161e2d] outline-none placeholder:text-[#5c5e61]/70"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    maxLength={128}
                    placeholder="Repeat password"
                    required
                  />
                </span>
              </label>
            ) : null}

            {error ? <p className="m-0 rounded-xl border border-[#b42318]/15 bg-[#b42318]/10 px-3.5 py-3 !text-[13px] font-bold leading-snug text-[#b42318]">{error}</p> : null}

            <button className="mt-1 !flex h-[54px] !items-center !justify-center gap-2.5 !rounded-full border-0 !bg-[#27427f] !text-[14px] font-black tracking-[0.08em] text-white uppercase transition-all hover:-translate-y-px hover:!bg-[#ffc900] hover:text-[#27427f] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isRegister ? "Creating account..." : "Signing in..."
                : isRegister ? "Create account" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-5 mb-0 text-center !text-[14px] text-[#5c5e61]">
            {isRegister ? "Already have an account?" : "New to Majestan?"}{" "}
            <Link href={isRegister ? "/login" : "/register"} className="font-black text-[#27427f] no-underline">
              {isRegister ? "Login" : "Create an account"}
            </Link>
          </p>
        </div>

        <aside className="!grid min-h-[520px] content-end rounded-[28px] border border-[#27427f]/10 bg-[linear-gradient(180deg,rgba(39,66,127,0.08),rgba(39,66,127,0.72)),url('/assets/images/page-title/page-title-4.jpg')] bg-cover bg-center !p-9 text-white shadow-[0_24px_70px_rgba(22,30,45,0.12)] max-[900px]:min-h-[360px] max-[640px]:rounded-[22px] max-[640px]:!p-6">
          <p className="mb-3 !text-[13px] font-extrabold tracking-[0.12em] text-white/80 uppercase">For buyers, tenants, owners, and investors</p>
          <h2 className="mb-6 max-w-xl font-['Lexend',sans-serif] text-[clamp(30px,4vw,52px)] font-extrabold leading-[1.06] tracking-normal text-white">One account for every property conversation.</h2>
          <div className="!flex flex-wrap gap-2.5">
            <span className="rounded-full border border-white/20 bg-white/15 px-3.5 py-2.5 !text-[12px] font-extrabold text-white">Saved shortlists</span>
            <span className="rounded-full border border-white/20 bg-white/15 px-3.5 py-2.5 !text-[12px] font-extrabold text-white">Faster enquiries</span>
            <span className="rounded-full border border-white/20 bg-white/15 px-3.5 py-2.5 !text-[12px] font-extrabold text-white">Verified assistance</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
