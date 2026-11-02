# Site frontend errors — 2 November 2026

## Search requests

The PSEO page forwarded arbitrary URL `keyword` values as `propertyName`, although the API accepts at most 120 characters. API 400 responses were rethrown during rendering. The shared property request builder now trims/bounds text to the API limits, admits only supported sort/listing/condition values, and normalizes pagination. This covers server seeds and browser filtering without weakening API validation.

The projects listing similarly forwarded unsupported project types/possession values and invalid numeric values. The request builder now accepts the API's apartment/villa and possession options, finite nonnegative prices, positive integer bedroom counts, and valid pagination. Project errors now retain the API validation reason. The original generic Projects 400 log lacks the URL/reason, so its exact offending parameter cannot be identified from that log alone.

Real upstream failures still propagate; these changes do not substitute an empty inventory response.

## Server Action lookup

The site has no application-defined Server Actions. An unknown action can be a stale deployment request or scanner traffic. Existing proxy filtering already rejects malformed action IDs; a correctly shaped unknown ID still reaches Next.js. These logs alone cannot distinguish the source.

The frontend build now receives the commit SHA as NEXT_DEPLOYMENT_ID through Actions and Docker. Next.js uses deployment identity to reload mismatched clients during navigation. This mitigates stale clients; it does not eliminate fabricated requests or replace consistent build artifacts across replicas. No encryption key was rotated.

## Images — still requires live asset/record repair

Read-only CDN HEAD checks confirmed these source paths return 404:

- `/uploads/temp/1792057730718-majestanrealty_1779881629_6a16d69dc748d.webp`
- `/uploads/properties/1791868542589-1740468220_67bd6ffc84e00.webp`
- `/uploads/1781268753915-1749011670_683fccd6ae4f6.jpg`

The first image exists at `/uploads/properties/1792057730718-majestanrealty_1779881629_6a16d69dc748d.webp` (200, image/webp). Its persisted temp reference can be replaced with that verified final key after identifying the owning record. The other two require locating/restoring the originals or replacing them through the CRM. Do not globally rewrite temp keys: processing failures can legitimately retain the original file. Frontend fallbacks do not restore missing objects or eliminate the initial optimizer 404.

No live records, database schema, or stored images were changed. Direct public API requests from the investigation environment returned 403, including a normal listing request, so live API behavior could not be verified from here.

## Verification

- Focused API/search tests: 19 passed, including 7 new regression cases.
- Full frontend tests: 780 passed; the same 4 previously known unrelated failures remain (wizard basic-info fixture, two ProjectGallery cases, Step3Location labels).
- Production build passed; diff whitespace check passed.
- Changes remain local and uncommitted pending review/deployment.
