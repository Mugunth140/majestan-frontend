import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** When true, renders a JSON-LD BreadcrumbList script tag for SEO */
  jsonLd?: boolean;
};

/**
 * Generates JSON-LD structured data for BreadcrumbList schema.
 * @see https://schema.org/BreadcrumbList
 */
function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  const baseUrl = "https://www.majestanrealty.com";
  const listItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

export function Breadcrumbs({ items, jsonLd = true }: BreadcrumbsProps) {
  return (
    <>
      <nav
        className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap hide-scrollbar mb-2 py-2"
        aria-label="Breadcrumb"
      >
        <ol
          className="flex items-center gap-1 min-w-0"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <li
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-[#27427f] transition-colors px-1.5 py-1!"
              itemProp="item"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only" itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const position = index + 2;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-0.5 shrink-0" />
                {isLast || !item.href ? (
                  <span
                    className="text-[#161e2d] font-normal capitalize! truncate max-w-[200px] md:max-w-[300px] px-1.5 py-1"
                    aria-current={isLast ? "page" : undefined}
                    itemProp="name"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-[#27427f] transition-colors truncate max-w-[150px] md:max-w-[250px]px-1.5 py-1"
                    itemProp="item"
                  >
                    <span itemProp="name" className="capitalize! hover:text-[#27427f] transition-colors cursor-pointer">{item.label}</span>
                  </Link>
                )}
                <meta itemProp="position" content={String(position)} />
              </li>
            );
          })}
        </ol>
      </nav>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbJsonLd(items)),
          }}
        />
      )}
    </>
  );
}
