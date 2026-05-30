import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex! items-center! text-sm! text-gray-500! overflow-x-auto! whitespace-nowrap! hide-scrollbar! mb-4!" aria-label="Breadcrumb">
      <ol className="flex! items-center! space-x-2! min-w-0!">
        <li>
          <Link href="/" className="hover:text-[#27427f]! transition-colors! flex! items-center!">
            <Home className="w-4! h-4!" />
            <span className="sr-only!">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex! items-center!">
              <ChevronRight className="w-4! h-4! text-gray-400! mx-1! flex-shrink-0!" />
              {isLast || !item.href ? (
                <span className="text-[#161e2d]! font-medium! truncate! max-w-[200px]! md:max-w-none!" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[#27427f]! transition-colors! truncate! max-w-[150px]! md:max-w-none!">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
