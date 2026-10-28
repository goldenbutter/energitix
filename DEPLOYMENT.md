# Deployment

- **Repository:** https://github.com/goldenbutter/energitix
- **Production branch:** `main`; Git integration is connected and pushes deploy automatically.
- **Preferred Vercel project:** [iBithun / energitix](https://vercel.com/i-bithun/energitix)
- **Project ID:** `prj_18PbXbA735aAwP3KTsUnRr3qkgni`
- **Team:** `i-bithun`
- **Project fallback:** https://energitix-three.vercel.app
- **Canonical website:** https://energetix.ibithun.com
- **Video player:** https://energetix.ibithun.com/teaser.html
- **Framework:** Vite / static React site
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Output:** `dist`
- **Application secrets / environment variables:** none required

## Two Vercel projects

The original deployment was created in `goldenbutters-projects`. A second import of the same GitHub repository exists in `i-bithun`. Both were confirmed to receive commits from `main`. This explains why the original domain was absent from the newly imported project's dashboard. The local checkout is now linked to `i-bithun/energitix` for future CLI operations. The original project and its `energitix.vercel.app` fallback are retained.

## Domain spelling and external DNS

The requested hostname is **energetix.ibithun.com**; the brand and GitHub repository are **ENERGITIX / energitix**. A separate `energitix.ibithun.com` entry was added to the new project by mistake. It has no matching CNAME and is not the site's canonical address.

Hostinger manages the zone through `apollo.dns-parking.com` and `athena.dns-parking.com`. The correct records for the iBithun project are:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `energetix` | `11371a23cb8cfe44.vercel-dns-016.com` | 3600 |
| TXT | `_vercel` | `vc-domain-verify=energetix.ibithun.com,14b6d3f798b6e8fe4afa` | 3600 |

Only the ENERGITIX verification TXT was corrected; other domain, website and mail records remain intact. The CNAME is configured correctly. The corrected TXT was saved in Hostinger and is visible through Google and Cloudflare DNS.

**Handover status, 28 October 2026:** the correct hostname has been added to `i-bithun/energitix`, but Vercel ownership verification is still pending. The original project's verified domain continues to serve the live site. Recheck the handover with:

```sh
vercel domains verify energetix.ibithun.com --project energitix --format=json --scope i-bithun
```

Do not change the parent domain's ownership, nameservers or unrelated DNS records to resolve this project-specific handover.

## Verification

The OG card and metadata are live on the custom domain. Requests using Facebook and LinkedIn crawler user agents retrieved the homepage and teaser metadata and the 1200 × 630 JPEG successfully with HTTP 200. The metadata is included in the initial HTML and does not require JavaScript.

Earlier visual regression checks passed at 1440 × 900 and 390 × 844 with 32 screenshots, no browser errors or horizontal overflow, working demo bag controls and reduced-motion checks. Focused film tests and the 72-comparison lettering suite are documented in `TESTING.md`. Temporary receipts and screenshots stay in ignored `analysis/`.

Vite may report an advisory about the Three.js chunk being larger than 500 kB; this does not fail the build.
