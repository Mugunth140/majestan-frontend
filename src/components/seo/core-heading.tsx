"use client";
import { createContext, useContext, type HTMLAttributes } from "react";
const Heading = createContext<string | undefined>(undefined);
export function SeoHeadingProvider({
  heading,
  children,
}: {
  heading?: string;
  children: React.ReactNode;
}) {
  return (
    <Heading.Provider value={heading || undefined}>{children}</Heading.Provider>
  );
}
export function SeoH1({
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  const heading = useContext(Heading);
  return <h1 {...props}>{heading || children}</h1>;
}
