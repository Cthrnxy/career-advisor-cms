# Career Advisor CMS

An independent React + Vite desktop-web frontend prototype for Career Advisors, including client management, combined 201/999 enrollment records, draft enrollment, case detail, activities, exits and follow-ups.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Data & privacy

**Synthetic test data only.** Local browser storage is used for UI prototyping. Do not upload real client documents, signatures, work permits, SSNs, or personal information. File actions simulate filename references, not actual uploads. A secure backend and permissions system would be required before real-world use.

## Deployment

Vercel (Vite framework, `npm run build`, output `dist`). GitHub integration can be connected after initial deployment. See `docs/WORKFLOWS.md` for agreed business rules.
