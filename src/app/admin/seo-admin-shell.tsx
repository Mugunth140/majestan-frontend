"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  IconButton,
  Skeleton,
  Text,
  Heading,
  Flex,
} from "@radix-ui/themes";
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
  { title: "Projects", url: "/admin/projects/seo", Icon: Building2 },
  { title: "Properties", url: "/admin/properties/seo", Icon: House },
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
  );
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (login) return;
    let live = true;
    seoApi("auth/me")
      .then((value) => {
        if (live) setUser(value);
      })
      .catch(() => {
        if (live) router.replace("/admin/login");
      });
    return () => {
      live = false;
    };
  }, [login, pathname, router]);
  if (login)
    return <div className="seo-command seo-login-wrap">{children}</div>;
  if (!user)
    return (
      <div className="seo-command seo-session-loading" role="status">
        <Skeleton width="240px" height="32px" />
        <Skeleton width="400px" height="120px" />
        <Text size="2">Checking your session…</Text>
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
            <Link
              href="/admin/projects/seo"
              className="seo-brand"
              aria-label="Majestan SEO workspace"
            >
              <img src="/assets/images/logo/logo.png" alt="Majestan Realty" />
            </Link>
            <IconButton
              variant="ghost"
              color="gray"
              className="seo-collapse"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </IconButton>
          </div>
          <Text size="1" weight="medium" className="seo-nav-caption">
            SEO MANAGEMENT
          </Text>
          <nav aria-label="SEO modules">
            {links.map(({ title, url, Icon }) => {
              const active = pathname === url || pathname.startsWith(url + "/");
              return (
                <Button
                  key={url}
                  asChild
                  variant={active ? "soft" : "ghost"}
                  color={active ? "blue" : "gray"}
                  size="3"
                >
                  <Link
                    href={url}
                    title={title}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} />
                    <span className="seo-nav-label">{title}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="seo-sidebar-foot">
            <Button asChild variant="ghost" color="gray">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                <span className="seo-nav-label">View website</span>
              </a>
            </Button>
          </div>
        </aside>
        <div className="seo-workspace">
          <header className="seo-topbar">
            <div>
              <Heading as="h2" size="3">
                SEO workspace
              </Heading>
              <Text size="1" color="gray">
                Majestan Realty
              </Text>
            </div>
            <Flex align="center" gap="3">
              <Avatar
                size="2"
                radius="full"
                fallback={
                  user.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase() || "M"
                }
              />
              <div className="seo-user">
                <Text size="2" weight="medium" as="div">
                  {user.name}
                </Text>
                <Text size="1" color="gray">
                  {user.email}
                </Text>
              </div>
              <Button
                variant="soft"
                color="red"
                onClick={async () => {
                  await seoApi("auth/logout", {});
                  setUser(null);
                  router.replace("/admin/login");
                }}
              >
                <LogOut size={16} />
                Sign out
              </Button>
            </Flex>
          </header>
          <main id="seo-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
