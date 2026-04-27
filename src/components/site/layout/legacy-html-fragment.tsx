type LegacyHtmlFragmentProps = {
  html: string;
  allowScripts?: boolean;
};

const SCRIPT_BLOCK_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const stripScriptBlocks = (html: string): string => {
  return html.replace(SCRIPT_BLOCK_PATTERN, "");
};

export function LegacyHtmlFragment({ html, allowScripts = false }: LegacyHtmlFragmentProps): React.JSX.Element {
  const renderedHtml = allowScripts ? html : stripScriptBlocks(html);

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
  }
