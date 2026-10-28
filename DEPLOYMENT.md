# Deployment

- **Repository:** https://github.com/goldenbutter/energitix
- **Production branch:** `main` (Git integration connected; pushes deploy automatically)
- **Vercel production URL:** https://energitix.vercel.app
- **Video player:** https://energitix.vercel.app/teaser.html
- **Initial deployment:** `dpl_BLB8fW9RncuLTazDwiZwGBZyC6cT` — ready
- **Vercel project:** `energitix`
- **Vercel team:** `goldenbutters-projects` (the team that holds `ibithun.com`)
- **Requested domain:** `energetix.ibithun.com`
- **Framework:** Vite / static React site
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Output:** `dist`
- **Secrets / environment variables:** none required

## Domain

The parent domain uses external nameservers (`apollo.dns-parking.com` and `athena.dns-parking.com`). Adding the subdomain to Vercel does not update external DNS. Vercel has verified domain ownership and attached the hostname to this project. The user added this record; both authoritative nameservers and Cloudflare’s public resolver return the expected CNAME:

| Type | Name / host | Target | TTL |
| --- | --- | --- | --- |
| CNAME | `energetix` | `926a4e370f410130.vercel-dns-017.com` | Provider default |

Do not change the parent domain’s nameservers or existing website/mail records. After saving the CNAME, allow DNS propagation and run:

```sh
vercel domains verify energetix.ibithun.com --scope goldenbutters-projects --non-interactive
```

**Live and verified on 28 October 2026.** Vercel reports `configured-correctly`, domain ownership verified, and no configuration issues. Public HTTPS requests return 200 for the website. The teaser supports HTTP byte-range requests (206), allowing seeking and streaming.

- Website: https://energetix.ibithun.com
- Teaser player: https://energetix.ibithun.com/teaser.html
- Vercel fallback: https://energitix.vercel.app

## Verification

Both locally and against the public Vercel production deployment, `npm run test:visual` passed at 1440 × 900 and 390 × 844 with 32 screenshots, zero browser errors, no horizontal overflow, working demo bag controls, and reduced-motion checks. Temporary screenshots and receipts stay in ignored `analysis/`.

Vite may report an advisory about the Three.js chunk being larger than 500 kB; this does not fail the build.
