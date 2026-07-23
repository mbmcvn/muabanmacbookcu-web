# Care Passport native migration audit and plan

Date: 2026-07-23

## Scope

Move the customer-facing `/care/[machine_id]` surface from `mbmc-care` to
`muabanmacbookcu-web`. The internal repository remains the system of record and
keeps its old route for now. No database schema, WordPress, DNS, inventory, or
publication workflow changes are in scope.

## Source route and dependency audit

The active source implementation is:

- `mbmc-care/app/care/[machine_id]/page.tsx`
- `mbmc-care/app/care/[machine_id]/activate/route.ts`
- `mbmc-care/app/care/[machine_id]/support/route.ts`

Historical files beside the active page are not route entries and must not be
copied.

The active page imports:

- `mbmc-care/lib/supabase.ts`, a browser-capable anon-key client
- `mbmc-care/lib/public-care-events.ts`, an allowlist that maps raw event types
  to synthesized public labels
- global Tailwind styles from the internal app layout

There are no Care-specific components, server actions, or RPC calls. The flow
uses direct Supabase table queries and writes.

### Reads

| Table | Selected fields | Public use |
| --- | --- | --- |
| `machines` | `id`, `machine_id`, `model_text`, `chip`, `ram_gb`, `ssd_gb`, `color`, `public_condition_note` | Identity, configuration, color, condition; UUID is server-only for joins |
| `sales` | `id`, `created_at` | Latest ownership cycle; both fields remain server-only except as inputs to derived state |
| `machine_owners` | `id`, `activated_at` | Derived activated state and public activation date; owner ID remains server-only |
| `machine_events` | `id`, `event_type`, `created_at` | Allowlisted post-sale public timeline only |

Activation must additionally compare the submitted data with the latest sale's
`buyer_name` and `buyer_phone`. Those values are private verification secrets
and are never part of the returned Care DTO or browser response.

Support submission reads only the current owner `id` and `phone`, then writes a
ticket and a synthesized public event.

### Writes

- Activation inserts `machine_owners` with `sale_id`, machine code, customer
  name, and normalized phone, then inserts an `activated` public event.
- Support inserts `support_tickets` with machine code, owner phone, selected
  category, description, and `open` status, then inserts a `support_ticket`
  public event.

### Environment

The flow needs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The destination already defines both. `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists
for other architecture but is not needed by the native Care flow.

### Privacy boundary

The following source/internal data must not be selected into, logged from, or
returned by the public Care read model:

- staff, reviewer, approver, and seller identities
- internal notes and raw event titles/notes
- purchase costs, sale prices, payment data, and commercial history
- buyer/owner name and phone
- customer needs, purchase reasons, lead sources, and support descriptions
- serial numbers and unrestricted machine or ownership history

Only an explicit public field allowlist and synthesized event labels may reach
React. The service-role key remains in a module marked `server-only`.

## Source behavior gap

The source activation handler validates phone length but does not compare the
submitted name or phone with the sale record. That permits activation with
arbitrary customer data. The destination implementation intentionally closes
this gap by requiring normalized name and phone to match the latest sale and
by returning a generic mismatch state.

## Destination architecture

The destination already uses a server-only Supabase service-role client and
explicit public projections under `src/data`. Care will follow the same model:

1. A dedicated `src/data/care` repository selects the minimum fields.
2. It assembles a frozen Care DTO containing no private customer or internal
   operational data.
3. Narrow server commands validate and perform activation/support writes.
4. Native App Router page and POST route handlers render and mutate within the
   same Next.js application.
5. Care-specific presentation uses locally scoped CSS and the existing root
   layout.

## Verification and rollout

1. Unit-test normalization, event allowlisting, DTO privacy, activation
   mismatch, activation success, already-activated behavior, and invalid code.
2. Exercise read states against configured data without printing PII.
3. Run destination lint, typecheck, tests, and production build.
4. Confirm the temporary external redirect is absent.
5. Run relevant source tests, lint, typecheck, and build.
6. Confirm `mbmc-care` redirects only `app.mbmc.vn/care/:path*` to the canonical
   `https://mbmc.vn/care/:path*`; retain the old page source.

No schema migration is planned.
