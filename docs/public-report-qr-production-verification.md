# Public report QR production verification — 2026-10-10

The supplied report `dcr_fxNwX0Z65JYjukFc4xKYpfzh` returned HTTP 200 during this audit. Its actual rendered image is a 232 × 232 inline PNG data URI. Decoding that production PNG yielded exactly:

`https://mbmc.vn/care/report/dcr_fxNwX0Z65JYjukFc4xKYpfzh`

The former endpoint `https://app.mbmc.vn/api/public/desktop/report/dcr_fxNwX0Z65JYjukFc4xKYpfzh/qr` still returns HTTP 404 with an HTML content type. The historical copy/share component (commit `63d6fb7`) fetched this endpoint on QR expansion, then attempted `createImageBitmap` on the response without checking its status. The local backend has the public report route but no corresponding report QR route. This explains why the historical QR request failed despite the report itself returning 200. Deployment history/cache state at the time of the original observation is unknown; the current production HTML no longer references that endpoint.

The existing fix is already in the current source and visible in production: `/care/report/[reportId]/page.tsx` calls `careReportQr`, which uses the installed `qrcode` library server-side. `PublicDeviceCheckReport` passes the PNG to `CopyReportLinkButton`, which renders a plain `<img>` with its data URI. There is no QR image fetch, image optimization route, external QR provider or additional dependency needed. Copy/share controls and selectable canonical URL remain present. Black modules, white background, four-module quiet zone, medium error correction and responsive sizing preserve readability in light/dark presentation.

This task adds regression coverage in `src/components/desktop/public-report-presentation.test.mjs`: the exact production report ID, decoded payload, inline-only image source, absent QR/optimization network path, preserved controls and malformed report ID handling before any network request. Report privacy, backend contracts, Desktop and discovery semantics are unchanged. The QR generator accepts only a validated public report ID and encodes the fixed HTTPS canonical URL, with no Serial, token, session identifier, query parameter or report payload.

Changed files in this task: this audit and the public-report test file. The runtime fix was already present, so no additional runtime deployment is required for the currently observed production page. If another environment still serves the old component, deploy the current web revision with `report-qr.server.ts`, route-side QR generation and the inline-image copy/share component together; no backend or Desktop deployment is required. Stale open pages may need reloading. No deployment was performed during this task.

Validation: 16 focused public-report tests passed; TypeScript and the production build passed. The build ran with expanded permissions because sandboxed SWC cannot canonicalize the Windows workspace path. Production HTML and PNG decoding were checked through read-only HTTP requests.
Scoped ESLint and git diff --check also passed.
