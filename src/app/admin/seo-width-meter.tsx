export function estimatePixelWidth(text: string, fontSize = 20): number {
  // Approximate proportional Arial glyph widths. Deterministic in SSR and browsers.
  return Math.round(
    [...text].reduce(
      (sum, char) =>
        sum +
        (/\s/.test(char)
          ? 0.28
          : /[ilI.,'!:;|]/.test(char)
            ? 0.25
            : /[MW@%]/.test(char)
              ? 0.89
              : /[A-Z]/.test(char)
                ? 0.67
                : /[^\x00-\x7F]/.test(char)
                  ? 0.85
                  : 0.5),
      0,
    ) * fontSize,
  );
}
export const sampleVariables: Record<string, string> = {
  BHK: "3 BHK",
  Project_Name: "Alamo Turin",
  Property_Name: "Garden Apartment",
  Property_Type: "Apartment",
  Transaction_Type: "Sale",
  SqFt: "1,250",
  Sub_Locality: "Gandhipuram",
  Locality: "Gandhipuram",
  Location: "Gandhipuram, Coimbatore",
  City: "Coimbatore",
  Price: "₹89 Lakh",
  Min_Price: "₹89 Lakh",
  Max_Price: "₹1.2 Cr",
  Builder: "Alamo XS",
  Builder_Name: "Alamo XS",
  RERA_ID: "TNRERA/11/BLG/0076/2026",
};
export function resolveSampleTokens(
  text: string,
  variables: Record<string, string> = {},
) {
  return text.replace(
    /\{([^}]+)\}/g,
    (token, key) => variables[key] ?? sampleVariables[key] ?? token,
  );
}
export function SeoWidthMeter({
  text,
  description = false,
}: {
  text: string;
  description?: boolean;
}) {
  const width = estimatePixelWidth(text, description ? 14 : 20);
  const risk = description
    ? width > 1100
      ? "high"
      : width > 920
        ? "warning"
        : "optimal"
    : width > 650
      ? "high"
      : width > 580
        ? "warning"
        : "optimal";
  const message = description
    ? risk === "optimal"
      ? "Optimal"
      : "Mobile cutoff / truncation possible"
    : risk === "high"
      ? "High Google title rewrite risk"
      : risk === "warning"
        ? "May truncate with ... on SERP, still indexed"
        : "Optimal";
  return (
    <small className={`seo-width-meter seo-width-${risk}`} role="status">
      {text.length} characters · approximately {width}px · {message}
      <span className="seo-meter-note">
        Estimated Arial width; actual search appearance varies.
      </span>
    </small>
  );
}
