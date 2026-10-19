"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  ExternalLink,
  Files,
  House,
  LogOut,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";

const links = [
  { title: "Projects SEO", url: "/admin/projects/seo", Icon: Building2 },
  { title: "Properties SEO", url: "/admin/properties/seo", Icon: House },
  { title: "Listing pages", url: "/admin/seo", Icon: MapPinned },
  { title: "Core & service pages", url: "/admin/pages", Icon: Files },
  { title: "Technical SEO", url: "/admin/technical", Icon: Settings2 },
];
export async function seoApi(path: string, body?: unknown, method?: string) {
  const res = await fetch("/api/seo-admin/" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const value = await res.json();
  if (!res.ok)
    throw new Error(
      Array.isArray(value.message)
        ? value.message.join(", ")
        : value.message || "Could not complete this request",
    );
  return value.data ?? value;
}
export function SeoAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    router = useRouter(),
    login = pathname === "/admin/login";
  const [user, setUser] = useState<{ name: string; email: string } | null>(
      null,
    ),
    [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (login) return;
    let live = true;
    seoApi("auth/me")
      .then((u) => {
        if (live) {
          setUser(u);
          setError("");
        }
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setUser(null);
          router.replace("/admin/login");
        }
      });
    return () => {
      live = false;
    };
  }, [login, pathname, router]);
  if (login)
    return <div className="seo-command seo-login-wrap">{children}</div>;
  if (!user)
    return (
      <div className="seo-command">
        <div className="seo-loading" role="status">
          {error || "Checking your session…"}
        </div>
      </div>
    );
  return (
    <div className="seo-command">
      <a className="seo-skip" href="#seo-main">
        Skip to content
      </a>
      <div className={`seo-app${collapsed ? " seo-app-collapsed" : ""}`}>
        <aside className="seo-sidebar">
          <div className="seo-brand-row">
            <Link href="/admin/projects/seo" className="seo-brand">
              <img src="/assets/images/logo/logo.png" alt="Majestan Realty" />
              <span>Admin Panel</span>
            </Link>
            <button
              type="button"
              className="seo-collapse"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </button>
          </div>
          <nav aria-label="SEO modules">
            {links.map(({ title, url, Icon }) => (
              <Link
                href={url}
                key={url}
                aria-label={title}
                title={title}
                aria-current={
                  pathname === url || pathname.startsWith(url + "/")
                    ? "page"
                    : undefined
                }
              >
                <Icon className="seo-nav-icon" aria-hidden="true" />
                <span className="seo-nav-label">{title}</span>
              </Link>
            ))}
          </nav>
          <div className="seo-sidebar-foot">
            <a href="/" target="_blank" rel="noreferrer">
              <span>View website</span>
              <ExternalLink className="seo-nav-icon" aria-hidden="true" />
            </a>
          </div>
        </aside>
        <div className="seo-workspace">
          <header className="seo-topbar">
            <span className="seo-topbar-title">Admin Panel</span>
            <div className="seo-profile">
              <span className="seo-avatar" aria-hidden="true">
                {user.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase() || "M"}
              </span>
              <span className="seo-user">
                <span>{user.name}</span>
                <small>{user.email}</small>
              </span>
              <button
                className="seo-button seo-secondary"
                type="button"
                onClick={async () => {
                  await seoApi("auth/logout", {});
                  setUser(null);
                  router.replace("/admin/login");
                }}
              >
                <LogOut className="seo-nav-icon" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </header>
          <main id="seo-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
