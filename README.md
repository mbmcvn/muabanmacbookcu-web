This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Public inventory data

The inventory and immutable-slug detail pages query the MBMC operational Supabase project only on the server. The query selects an explicit minimal set of machine, publication, editorial, and commercial-image columns, then passes every candidate through the canonical public projection before rendering. Browser components receive only Summary V1 or Detail/Passport V1 DTOs.

Both routes use a 60-second revalidation window. A sold, archived, unpublished, stale-revision, privacy-invalid, or otherwise ineligible machine disappears no later than that window after the source change.

Deployment requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. The service role is required because publication/editorial rows are owner-protected operational data; it must never be exposed to browser code or use a `NEXT_PUBLIC_` name.

Before real stock can appear:

1. Apply `20260717090000_add_machine_publications_and_editorials.sql` from the `mbmc-care` repository through the controlled migration process.
2. Run the owner-checked, draft-only `20260720_create_publication_drafts_for_current_inventory.sql` backfill.
3. Manually review each editorial revision, approve it, and publish it through the database lifecycle.

The backfill never creates review, approval, or publication actors. Until those manual steps are complete, zero machines are intentionally eligible.