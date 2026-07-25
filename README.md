# MBMC Public Website

This repository implements MBMC's public website: homepage, inventory, public Machine detail, recommendation flow, and public Care presentation.

## Read first

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — verified website technical architecture.
2. [Decision Dossier v1 contract](./docs/decision-dossier-v1-contract.md) — current product contract for Machine detail.
3. [Public Content Governance plan](./docs/phase-4a-public-content-governance-plan.md) — planning/history, not current-state authority.
4. Sibling canonical documents:
   - [MBMC architecture](../mbmc-care/ARCHITECTURE.md)
   - [Domain map](../mbmc-care/DOMAIN_MAP.md)
   - [Current state](../mbmc-care/CURRENT_STATE.md)
   - [Public contract](../mbmc-care/PUBLIC_CONTRACT.md)
   - [Privacy standard](../mbmc-care/PRIVACY.md)

Historic audits, migration plans, and phase plans preserve useful context but are not current-state authority unless explicitly marked current.

## Local commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run test:public
npm run test:quiz
```

Required Supabase environment configuration is described by the active server client in `src/lib/supabase/server.ts`. Never expose the service-role key to browser code.
