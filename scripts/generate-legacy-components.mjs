import { promises as fs } from "node:fs";
import path from "node:path";

const frontendRoot = process.cwd();
const workspaceRoot = path.resolve(frontendRoot, "..");
const legacyViewsRoot = path.join(workspaceRoot, "Project", "application", "views");

const viewsOutDir = path.join(frontendRoot, "src", "components", "site", "views");
const layoutOutDir = path.join(frontendRoot, "src", "components", "site", "layout");
const registryOutFile = path.join(frontendRoot, "src", "lib", "site", "page-registry.ts");

const escapeTemplateLiteral = (value) =>
  value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

const toPascalCase = (input) =>
  input
    .replace(/\.php$/i, "")
    .replace(/[_-]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (m) => m.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

const resolveBaseUrlArgument = (rawArgument) => {
  const argument = rawArgument.trim();
  if (argument.length === 0) {
    return "/";
  }

  const quotedParts = Array.from(argument.matchAll(/'([^']*)'|\"([^\"]*)\"/g)).map(
    (match) => match[1] ?? match[2] ?? "",
  );

  if (quotedParts.length === 0) {
    return "/";
  }

  const combined = quotedParts.join("").trim();
  if (combined.length === 0) {
    return "/";
  }

  if (/^https?:\/\//i.test(combined)) {
    return combined;
  }

  return `/${combined}`.replace(/\/+/, "/");
};

const stripPhpAndResolveUrls = (template) => {
  let output = template.replace(/\r\n/g, "\n");

  output = output.replace(/<\?=\s*\$canonical\s*;?\s*\?>/gi, "");
  output = output.replace(/<\?php\s+echo\s+current_url\(\)\s*;?\s*\?>/gi, "");

  output = output.replace(/<\?php\s+echo\s+base_url\(\s*\)\s*;?\s*\?>/gi, "/");
  output = output.replace(/<\?=\s*base_url\(\s*\)\s*;?\s*\?>/gi, "/");

  output = output.replace(
    /<\?php\s+echo\s+base_url\((.*?)\)\s*;?\s*\?>/gims,
    (_fullMatch, arg) => resolveBaseUrlArgument(arg),
  );

  output = output.replace(
    /<\?=\s*base_url\((.*?)\)\s*;?\s*\?>/gims,
    (_fullMatch, arg) => resolveBaseUrlArgument(arg),
  );

  output = output.replace(/<\?php[\s\S]*?\$this->load->view\([\s\S]*?\)\s*;?\s*\?>/gim, "");
  output = output.replace(/<\?(?:php|=)[\s\S]*?\?>/gim, "");

  output = output.replace(/https?:\/\/majestanrealty\.com/gi, "");
  output = output.replace(/(href|src)=\"\/\//g, '$1="/');
  output = output.replace(/(href|src)='\/\//g, "$1='/");

  return output.trim();
};

const extractAfterBodyOpen = (html) => {
  const bodyTagMatch = html.match(/<body[^>]*>/i);
  if (!bodyTagMatch) {
    return html;
  }

  return html.slice((bodyTagMatch.index ?? 0) + bodyTagMatch[0].length).trim();
};

const extractBeforeBodyClose = (html) =>
  html.replace(/<\/body>\s*<\/html>\s*$/i, "").trim();

const removeFullDocumentTags = (html) =>
  html
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head>[\s\S]*?<\/head>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .trim();

const createViewComponentSource = (componentName, html) => `import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const html = \`${escapeTemplateLiteral(html)}\`;

export function ${componentName}(): React.JSX.Element {
  return <LegacyHtmlFragment html={html} />;
}
`;

await fs.mkdir(viewsOutDir, { recursive: true });
await fs.mkdir(layoutOutDir, { recursive: true });
await fs.mkdir(path.dirname(registryOutFile), { recursive: true });

const entries = await fs.readdir(legacyViewsRoot, { withFileTypes: true });
const viewFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".php"))
  .map((entry) => entry.name)
  .sort();

const componentRecords = [];

for (const viewFile of viewFiles) {
  const raw = await fs.readFile(path.join(legacyViewsRoot, viewFile), "utf8");
  const sanitized = stripPhpAndResolveUrls(raw);
  const body = removeFullDocumentTags(sanitized);

  const componentName = `${toPascalCase(viewFile)}View`;
  const componentFile = `${componentName}.tsx`;
  const componentPath = path.join(viewsOutDir, componentFile);

  await fs.writeFile(componentPath, createViewComponentSource(componentName, body), "utf8");

  componentRecords.push({
    viewFile,
    componentName,
    componentFile,
  });
}

const headerRaw = await fs.readFile(path.join(legacyViewsRoot, "includes", "header.php"), "utf8");
const footerRaw = await fs.readFile(path.join(legacyViewsRoot, "includes", "footer.php"), "utf8");

let headerHtml = stripPhpAndResolveUrls(headerRaw);
headerHtml = extractAfterBodyOpen(headerHtml);
headerHtml = headerHtml.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, "").trim();

let footerHtml = stripPhpAndResolveUrls(footerRaw);
footerHtml = extractBeforeBodyClose(footerHtml);
footerHtml = removeFullDocumentTags(footerHtml);

const headerSource = `import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const headerMarkup = \`${escapeTemplateLiteral(headerHtml)}\`;

export function SiteHeader(): React.JSX.Element {
  return <LegacyHtmlFragment html={headerMarkup} />;
}
`;

const footerSource = `import { LegacyHtmlFragment } from "@/components/site/layout/legacy-html-fragment";

const footerMarkup = \`${escapeTemplateLiteral(footerHtml)}\`;

export function SiteFooter(): React.JSX.Element {
  return <LegacyHtmlFragment html={footerMarkup} />;
}
`;

await fs.writeFile(path.join(layoutOutDir, "site-header.tsx"), headerSource, "utf8");
await fs.writeFile(path.join(layoutOutDir, "site-footer.tsx"), footerSource, "utf8");

const importLines = componentRecords
  .map(
    (record) =>
      `import { ${record.componentName} } from "@/components/site/views/${record.componentName}";`,
  )
  .join("\n");

const mapEntries = componentRecords
  .map((record) => `  "${record.viewFile}": ${record.componentName},`)
  .join("\n");

const registrySource = `${importLines}

export const VIEW_COMPONENTS = {
${mapEntries}
} as const;

export type LegacyViewName = keyof typeof VIEW_COMPONENTS;
`;

await fs.writeFile(registryOutFile, registrySource, "utf8");

console.log(`Generated ${componentRecords.length} TSX view components plus shared layout components.`);
