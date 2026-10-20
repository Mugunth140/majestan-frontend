"use client";
import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
const FooterContent = createContext<ReactNode>(null);
export function SeoFooterContent() {
  return useContext(FooterContent);
}
const Heading = createContext<string | undefined>(undefined);
export function SeoHeadingProvider({
  heading,
  children,
  footerContent,
}: {
  heading?: string;
  children: React.ReactNode;
  footerContent?: ReactNode;
}) {
  return (
    <Heading.Provider value={heading || undefined}>
      <FooterContent.Provider value={footerContent || null}>
        {children}
      </FooterContent.Provider>
    </Heading.Provider>
  );
}
export function SeoH1({
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  const heading = useContext(Heading);
  return <h1 {...props}>{heading || children}</h1>;
}
