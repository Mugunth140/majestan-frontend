"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import Image from "next/image";

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

export function AuthPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as AuthResponse;

      if (!response.ok || !payload.data?.accessToken) {
        throw new Error(getErrorMessage(payload.message));
      }

      window.localStorage.setItem("majestan_access_token", payload.data.accessToken);
      window.localStorage.setItem("majestan_user", JSON.stringify(payload.data.user));

      const role = payload.data.user?.role?.toLowerCase();
      if (role === "admin" || role === "staff") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full! max-w-md! mx-auto! bg-white! rounded-3xl! shadow-[0_24px_70px_rgba(22,30,45,0.12)]! p-10! border! border-[#27427f]/10!">
      <div className="flex! justify-center! mb-8!">
        <Image src="/assets/images/logo/fav.png" alt="Majestan Logo" width={60} height={60} className="object-contain!" priority />
      </div>
      
      <div className="text-center! mb-8!">
        <h1 className="text-3xl! font-semibold! text-[#27427f]! font-sans! mb-2!">Welcome Back</h1>
        <p className="text-[#5c5e61]! text-[14px]!">Sign in to access your dashboard.</p>
      </div>

      <form className="flex! flex-col! gap-5!" onSubmit={handleSubmit}>
        <label className="flex! flex-col! gap-2!">
          <span className="text-[13px]! font-semibold! text-[#27427f]! font-sans!">Email</span>
          <div className="flex! items-center! gap-3! rounded-2xl! border! border-[#27427f]/10! bg-[#f7f8fb]! px-4! transition-all! focus-within:border-[#27427f]/45! focus-within:bg-white! focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]!">
            <Mail size={18} className="text-[#27427f]/70!" />
            <input
              className="h-13! w-full! border-0! bg-transparent! text-[14px]! text-[#161e2d]! outline-none! placeholder:text-[#5c5e61]/70!"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <label className="flex! flex-col! gap-2!">
          <span className="text-[13px]! font-semibold! text-[#27427f]! font-sans!">Password</span>
          <div className="flex! items-center! gap-3! rounded-2xl! border! border-[#27427f]/10! bg-[#f7f8fb]! px-4! transition-all! focus-within:border-[#27427f]/45! focus-within:bg-white! focus-within:shadow-[0_0_0_4px_rgba(39,66,127,0.08)]!">
            <LockKeyhole size={18} className="text-[#27427f]/70!" />
            <input
              className="h-13! w-full! border-0! bg-transparent! text-[14px]! text-[#161e2d]! outline-none! placeholder:text-[#5c5e61]/70!"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
            />
          </div>
        </label>

        {error ? <p className="m-0! rounded-xl! border! border-[#b42318]/15! bg-[#b42318]/10! px-4! py-3! text-[13px]! font-bold! text-[#b42318]! text-center!">{error}</p> : null}

        <button 
          className="mt-2! flex! h-13.5! w-full! items-center! justify-center! gap-2.5! rounded-full! border-0! bg-[#27427f]! text-[16px]! font-sans! font-semibold! tracking-[0.08em]! text-white! transition-all! duration-300 hover:bg-[#ffc900]! hover:text-[#27427f]! disabled:cursor-wait! disabled:opacity-70!" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
