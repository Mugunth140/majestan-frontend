"use client";
import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { seoApi } from "./seo-admin-shell";
type Row = Record<string, unknown>;
type Version = { id: number; revision: number; created_at: string };

export function seoWarnings(config: Row, target: Row = {}): string[] {
  const warnings: string[] = [];
  const title = String(config.meta_title || '').trim();
  const name = String(target.name || target.title || '').trim();
  if (name && title && !title.toLowerCase().includes(name.toLowerCase()) && !/[{}]/.test(title)) warnings.push('The title does not include this record’s name. Check that it describes the selected property.');
  if (/\b0(?:\.0+)?\s*sq\.?\s*ft/i.test(title)) warnings.push('The title contains a zero area. Remove unknown measurements.');
  if (/(?:coimbatore\s*,?\s*){2}/i.test(title)) warnings.push('The city appears more than once.');
  if (target.listing_type === 'Rent' && /for sale/i.test(title)) warnings.push('This rental title says for sale.');
  return warnings;
}

export function SeoReview({ initial, current, target, onRestored }: { initial: Row; current: Row; target?: Row; onRestored: () => void }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const changes = Object.keys(current).filter(key => !['revision','created_at','updated_at'].includes(key) && JSON.stringify(current[key]) !== JSON.stringify(initial[key]));
  const warnings = seoWarnings(current, target);
  const key = String(current.config_key || initial.config_key || "");
  const path = String(current.public_path || initial.public_path || "");
  async function run(action: () => Promise<void>) {
    setBusy(true); setStatus('');
    try { await action(); } catch (error) { setStatus((error as Error).message); } finally { setBusy(false); }
  }
  return <section className="seo-panel" aria-label="SEO review and history">
    <h3>Review and verify</h3>
    {warnings.length > 0 && <ul>{warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>}
    <details><summary>Changed fields ({changes.length})</summary>
      {!changes.length && <p>No changes in this form.</p>}
      {changes.map(field => <details key={field}><summary>{field.replaceAll('_',' ')}</summary><p>Before</p><pre className="seo-code">{JSON.stringify(initial[field] ?? null, null, 2)}</pre><p>After</p><pre className="seo-code">{JSON.stringify(current[field] ?? null, null, 2)}</pre></details>)}
    </details>
    {path && <Button type="button" variant="soft" disabled={busy} onClick={() => run(async () => {
      const response = await fetch('/api/seo-verify?path=' + encodeURIComponent(path), { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Verification failed');
      setStatus(`Public response: ${result.status}. Title: ${result.title || 'missing'}. Canonical: ${result.canonical || 'missing'}. Robots: ${result.robots || 'not specified'}.${result.location ? ' Redirect: ' + result.location : ''}`);
    })}>Verify saved public page</Button>}
    {key && Number(initial.revision) > 0 && <Button type="button" variant="soft" disabled={busy} onClick={() => run(async () => setVersions(await seoApi('history/' + encodeURIComponent(key))))}>View saved versions</Button>}
    {versions && <ul>{!versions.length && <li>No previous versions yet. Future saves retain a restore point.</li>}{versions.map(version => <li key={version.id}>
      Revision {version.revision} · {new Date(version.created_at).toLocaleString()}{' '}
      <Button type="button" variant="soft" disabled={busy} onClick={() => run(async () => {
        await seoApi(`history/${encodeURIComponent(key)}/${version.id}/restore`, { revision: initial.revision });
        onRestored();
      })}>Restore editable fields</Button>
    </li>)}</ul>}
    <p>Verification reads the saved public page. Previews are estimates of search appearance. Restoring keeps the current public URL.</p>
    {status && <p role="status">{status}</p>}
  </section>;
}
