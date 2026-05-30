import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/home/site-footer";

export default function PublicFullLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {/* No pt-[120px]! padding so hero sections start at the absolute top of the screen */}
      <div>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
