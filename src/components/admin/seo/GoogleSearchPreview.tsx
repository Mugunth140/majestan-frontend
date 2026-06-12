'use client';

interface GoogleSearchPreviewProps {
  title?: string;
  description?: string;
  slug?: string;
}

export function GoogleSearchPreview({ title, description, slug }: GoogleSearchPreviewProps) {
  const displayTitle = title?.trim() || 'No title set';
  const displayDescription = description?.trim() || 'No description set.';
  const breadcrumb = slug
    ? `property-website.com › property › ${slug}`
    : 'property-website.com › property';

  return (
    <div className="!rounded-xl !border-l-4 !border-l-[#27427f] !bg-[#0f1117] !border !border-[#262730] !p-4 !mt-4">
      <p className="!text-[11px] !font-semibold !uppercase !tracking-wider !text-gray-500 !mb-3">
        Google Search Preview
      </p>
      {/* Fake address bar */}
      <div className="!flex !items-center !gap-2 !bg-[#1a1f2e] !rounded-full !px-3 !py-1.5 !mb-4 !max-w-sm">
        <span className="!text-gray-500 !text-[12px]">&#128269;</span>
        <span className="!text-gray-400 !text-[12px] !truncate">
          property-website.com
        </span>
      </div>
      {/* Search result card */}
      <div className="!space-y-1">
        <p className="!text-[12px] !text-green-400 !font-normal !leading-snug">
          {breadcrumb}
        </p>
        <p className="!text-[18px] !text-[#6b9ef7] !font-normal !leading-tight hover:!underline !cursor-default !line-clamp-2">
          {displayTitle}
        </p>
        <p className="!text-[14px] !text-gray-400 !leading-relaxed !line-clamp-3">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}
