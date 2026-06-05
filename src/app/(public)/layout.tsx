import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/home/site-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <div>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
