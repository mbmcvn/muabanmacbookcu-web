# Care Discovery V2 public web

## Audit and contract migration

Before this change, `public-inspection.server.ts` validated a flat `reports` array, `CareLookupResults.tsx` used it for the summary count/model and generic report list, and `/care` rendered every report immediately. The direct report route already fetched independently of lookup and used `noindex, nofollow`. `CopyReportLinkButton.tsx` already supported copying/sharing, but fetched a backend QR into a canvas only after expansion. No QR dependency was installed.

Lookup now requires `schema: mbmc.public-care-lookup.v2`, `inspection_reports`, `user_reports.count`, nullable machine identity/path and warranty. There is no V1 lookup presentation fallback. The secondary endpoint's actual backend schema is `mbmc.public-care-user-reports.v1`, with minimized `reports` links; this is a separate endpoint contract, not V1 lookup compatibility.

The parser validates schema, canonical local paths/report IDs, timestamps, warranty status/fields, inspection publication types and a nonnegative safe-integer user count. It constructs new public-only objects rather than passing unknown backend fields to clients. Missing or malformed contracts fail closed with the existing unavailable state.

## Presentation and interaction

Machine identity, image, Machine ID, authoritative warranty state/dates/duration and Care link precede the inspection section. Inspection cards show backend inspector names, existing verified/delegated presentation labels, device name, accepted `<time>` and “Xem báo cáo”. No identity inference, ranking or classification is performed. Zero inspections retain their own quiet empty state.

The lower-emphasis user disclosure shows the exact count and “Xem kết quả”; count zero omits it. Only an explicit click POSTs the original lookup through the same-origin `/api/public/care/user-reports` route. The client retains the submitted lookup only in memory and request transport. Both proxy routes project backend responses and omit the lookup from their return values. Loading, error/retry, loaded and idle states are exercised. Loaded links sort newest-first and remain cached through collapse/reopen. Each submitted lookup remounts the disclosure to prevent stale results.

## QR and direct reports

The report route generates a 232px PNG locally with `qrcode`, medium error correction, black modules, fixed white background and a four-module quiet zone. Input is exclusively `https://mbmc.vn/care/report/<validatedReportId>`. No report payload, Serial, credential, session ID or query parameter is passed to the QR generator. The existing copy/share controls display the canonical URL and the always-visible QR, meaningful image alt text and “Quét mã để mở báo cáo”. The white card and responsive image preserve contrast in dark/light themes and fit narrow screens.

Direct report loading still uses only the public report endpoint, independently of Care lookup, and still handles absent reports through `notFound()`. Evidence rendering and report privacy are unchanged. Tests invoke this direct route with a valid fixture ID and mocked public backend; no live production acceptance claim is made. A real POST2 `response.report_url` smoke test belongs to coordinated rollout.

## Privacy and accessibility

The lookup parsers discard extra private fields at every projected level. Serial submission on `/care` uses POST rather than GET: an actual production HTML check showed that Next.js embeds GET query strings in Flight hydration data even when visible fields are cleared. The controller clears the Serial input, never adds it to a URL, and preserves it only in client memory and request transport for the secondary explicit load. Existing Machine ID/shorthand GET links continue to work. Legacy Serial GET URLs redirect to clean `/care` and require re-entry through its POST form. This removes serials from rendered lookup HTML/API responses; it cannot erase previously visited URLs from browser history/logs. Report privacy and evidence presentation remain unchanged.

Native disclosure/retry buttons support keyboard activation; disclosure exposes `aria-expanded`/`aria-controls`, loading and failures expose status/alert semantics, accepted dates use `<time>`, and report links use `nofollow`. Existing report and Care metadata retain `noindex, nofollow`.

## Files

- `src/data/care/public-care-contract.ts`: public lookup/secondary types and fail-closed projection.
- `src/data/care/public-inspection.server.ts`: V2 lookup parsing and secondary POST reader.
- `src/app/care/page.tsx`: hierarchy, Machine ID GET lookup and legacy Serial redirect.
- `src/app/care/CareLookupResults.tsx`: primary inspection summary/list.
- `src/app/care/CareLookupController.tsx`: POST lookup, client-only lookup memory, response state and hierarchy.
- `src/app/api/public/care/lookup/route.ts`: minimized lookup/machine POST proxy.
- `src/app/api/public/care/user-reports/route.ts`: minimized secondary POST proxy.
- `src/components/care/CareLookupForm.tsx`: optional submit handler and loading/disabled button, retaining default shared GET behavior elsewhere.
- `src/app/care/CareUserReports.tsx`: secondary disclosure and request states.
- `src/app/care/lookup.module.css`: secondary emphasis and responsive CTA sizing.
- `src/lib/care-report/report-qr.server.ts`: validated canonical URL and local PNG.
- `src/app/care/report/[reportId]/page.tsx`: direct route QR generation.
- `src/components/desktop/PublicDeviceCheckReport.tsx`: QR prop through existing report presentation.
- `src/components/desktop/CopyReportLinkButton.tsx`: static QR, canonical text and preserved copy/share.
- `src/data/care/care-lookup-errors.test.mjs`: V2, interaction, errors, identity/warranty and privacy tests.
- `src/components/desktop/public-report-presentation.test.mjs`: QR decoding and independent direct route tests.
- `package.json`, `package-lock.json`: QR runtime/types and interaction/PNG decoding test dependencies.
- This audit document.

## Verification and rollout

50 focused Care/report tests pass. TypeScript, scoped ESLint, production build and `git diff --check` pass. The build required expanded permissions because sandboxed SWC could not canonicalize the Windows workspace path. QR tests decode the actual PNG and check its exact canonical URL and white quiet-zone pixel. Existing identity, public cover/image, Machine ID and warranty behavior tests pass. A production HTTP smoke check confirms that a legacy Serial query redirects to clean `/care`, the final HTML contains no test Serial and exposes a POST form, and invalid POST input returns a generic 400 response. Two stale pre-existing assertions were updated to reflect the current shared Care navigation and existing `--positive` warranty dot color.

Coordinate backend V2 lookup and user-reports endpoint deployment first, followed immediately by this web build. Gate traffic or use a coordinated release window: old V1 web and new V2 backend are not mutually compatible. Verify both endpoint schemas before releasing web traffic; test Serial and Machine ID lookup, user disclosure/retry, direct verified/delegated/self-check report URLs and a real POST2 `report_url` from another device. Update/release Desktop handoff after those checks. For rollback, restore backend/web as a compatible pair. No deployment or Desktop code change was performed here.
