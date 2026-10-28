# Deployment

- **Repository:** https://github.com/goldenbutter/energitix
- **Production branch:** `main`
- **Vercel project:** `energitix`
- **Vercel team:** `goldenbutters-projects` (the team that holds `ibithun.com`)
- **Requested domain:** `energetix.ibithun.com`
- **Framework:** Vite / static React site
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Output:** `dist`
- **Secrets / environment variables:** none required

## Domain

The parent domain uses external nameservers (`apollo.dns-parking.com` and `athena.dns-parking.com`). Adding the subdomain to Vercel does not update external DNS. Vercel has verified domain ownership and attached the hostname to this project. External DNS still needs this record:

| Type | Name / host | Target | TTL |
| --- | --- | --- | --- |
| CNAME | `energetix` | `926a4e370f410130.vercel-dns-017.com` | Provider default |

Do not change the parent domain’s nameservers or existing website/mail records. After saving the CNAME, allow DNS propagation and run:

```sh
vercel domains verify energetix.ibithun.com --scope goldenbutters-projects --non-interactive
```

Custom-domain activation is pending this external DNS change.

## Verification

Before publication, `npm run test:visual` passed at 1440 × 900 and 390 × 844 with 32 screenshots, zero browser errors, no horizontal overflow, working demo bag controls, and reduced-motion checks. Temporary screenshots and receipts stay in ignored `analysis/`.

Vite may report an advisory about the Three.js chunk being larger than 500 kB; this does not fail the build.
