# Origin-specific mobile interaction incident — 2026-10-06

The incident is now reproduced and resolved on the actual development origin, `http://100.103.44.105:3000`. The previous production-mode checks on port 3017 did not reproduce this development-only failure and must not be treated as verification of port 3000.

## Same-browser origin comparison

Temporary early server-rendered diagnostics recorded these native browser values; the diagnostic script was removed after the audit:

| Origin | isSecureContext | typeof navigator.clipboard | typeof crypto.randomUUID |
| --- | --- | --- | --- |
| http://localhost:3000 | true | object | function |
| http://100.103.44.105:3000 | false | undefined | undefined |

Clipboard access in application code happened only inside copy actions, with rejection caught by the existing share helpers. No clipboard exception during module evaluation/render/effect initialization caused the global failure. The unrelated secure-context-only randomUUID calls are in lead/Care form components, not the affected homepage/header/inventory initialization path.

## Confirmed shared cause and fix

The Next.js 16.2.10 dev server log reported `Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "100.103.44.105"`. Before the fix, localhost logged `[HMR] connected` and its hamburger worked; Tailscale did neither. JavaScript chunks loaded (including the React DevTools startup message), but the rendered controls did not transition state. No application uncaught exception or failed JavaScript chunk was observed.

The installed Next client creates a development React debug channel for its initial RSC stream, and awaits that stream before hydrating the root. Its dev debug data is delivered through the HMR connection. The blocked dev connection stalled hydration/event attachment. This was an origin allowlist problem specific to development, separate from HTTP clipboard availability.

`next.config.ts` now sets `allowedDevOrigins: ["100.103.44.105"]`, following the installed Next guide. Only that explicit hostname is added; no wildcard, bypass or production origin change is used. The dev server automatically restarted on the configuration edit. The Tailscale origin then logged `[HMR] connected`, and its menu became interactive without changing the menu/filter handlers.

## Port-3000 verification after the fix

At verified 390px and 444px widths on the Tailscale HTTP development origin: menu opens/closes, every visible filter and sort dropdown opens, canonical attributed copy succeeds through the fallback, and no horizontal overflow appears. Search, filter selection, sort selection and card navigation were also exercised. Client error inspection found no uncaught exception after the fix.

All five public clipboard consumers now use `copyText`: machine links, inventory links, Machine ID, report links/IDs, and chooser summary handoff. It detects the Clipboard API defensively inside the action, catches denied access, and tries the temporary text-selection fallback. A missing/failed fallback is caught by the component's existing feedback flow. Capability absence never accesses browser globals during module evaluation or render.

HTTPS is optional for these interactions now. Use a trusted HTTPS origin when testing secure-context-only browser APIs; HTTPS setup is not part of this change. A new HTTPS dev hostname would need its own explicit Next dev-origin allowlist entry.

## Files changed in the origin fix

- `next.config.ts`: explicit Tailscale development hostname.
- `src/lib/copy-text.ts`: safe feature detection and unavailable-fallback handling.
- `src/components/contact/CopyInventoryLink.tsx`, `src/components/desktop/CopyReportLinkButton.tsx`, `src/app/(sales)/may/[slug]/_components/MachineIdentity.tsx`, `src/app/(sales)/chon-macbook/RecommendationView.tsx`: use the shared clipboard helper.
- `src/lib/dev-origin.test.mjs`: actual Next dev-origin policy regression and public clipboard-consumer assertions.
- `src/components/contact/copy-machine-link-interaction.test.mjs`, `src/components/layout/navigation.test.mjs`, `src/lib/public-machine-detail-render.test.mjs`, `src/lib/contact-routing.test.mjs`: secure/insecure context, isolation, render safety and helper integration regressions.
- This audit report.

Validation: 211 focused tests, TypeScript, scoped ESLint, production build and `git diff --check` pass. No commit, push, deploy or production mutation occurred.

## Shared layer findings

- `SiteHeader` owns the hamburger state. The mobile panel is conditionally mounted only when open, rather than transparent while closed. It has no full-screen backdrop.
- `NavigationSubmenu` owns bounded absolute desktop panels and static mobile children. Hidden desktop panels use `display: none`; the hover bridge is only 8px tall.
- Pointer hit tests over the hamburger, search and card copy control returned the controls or their descendants. No persistent invisible covering layer was found. Browser console inspection showed no hydration errors.
- Header and filter outside-pointer listeners only close their own state; they do not cancel page clicks. The mobile header stops propagation of pointerdown only inside its bounded wrapper.

## Browser interactions performed

Earlier production-preview checks (retained as historical evidence, separate from the corrected port-3000 verification):

- Hamburger opens; second click closes; closed panel is absent.
- Price, family, chip, RAM and sort dropdowns open and close after a menu open/close cycle.
- Selecting Air changes the heading to `Mac Air đang có`, preserves `ref=MBMC` and changes 30 cards to 11 (current public fixtures/data).
- Searching M4 changes the list to two cards; clearing search restores it.
- Copy writes `https://mbmc.vn/may/mbmc-ftff?ref=MBMC` without navigation. The button exposes `data-feedback=copied`, a green border and pale surface, then resets to idle.
- Copy also succeeds on the non-localhost HTTP network preview, exercising compatibility with an insecure origin.
- Card link navigates to the canonical machine route with ref retained. Detail thumbnails, next-image and fullscreen controls work; closing fullscreen removes its overlay.
- Neither mobile width has horizontal overflow.

Read-only comparison on mbmc.vn at 390px: hamburger and family dropdown both respond, with no logged hydration error.

## Confirmed copy weakness and change

Previously `CopyMachineLink` directly required `navigator.clipboard.writeText`; unavailable/rejected clipboard access produced only a visually hidden failure announcement in compact mode. The new `copyText` helper first tries that API, then a temporary 1px, non-pointer-intercepting textarea and legacy copy command, removing it in `finally` and restoring focus. Failure is now visible beside the compact control, with no raw error details. Canonical URL construction and attribution are unchanged.

The button explicitly prevents default and stops click propagation. It keeps its rightmost 44px target and approximately 14px edge inset. Success uses a checkmark, authority-green border and pale accent background for 1200ms. No z-index changes or per-control pointer-events overrides were added.

## Regression coverage

Tests call actual rendered header/filter/copy handlers and replay state updates, rather than checking only source strings. They cover toggle/close/unmount, child destinations, each filter panel, selection, exact canonical copy, event isolation, success/reset, fallback cleanup and visible failure. Browser verification complements these adapters with real layout and pointer hit testing; the adapters alone cannot detect a covering layer or a failed client bundle.
