"use client";
import { usePathname } from "next/navigation";
const styles = [
  "bootstrap",
  "animate.min",
  "magnific-popup.min",
  "odometer.min",
  "swiper-bundle.min",
  "sib-styles",
  "styles",
];
export function PublicStyles() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      {styles.map((name) => (
        <link key={name} rel="stylesheet" href={`/assets/css/${name}.css`} />
      ))}
    </>
  );
}
