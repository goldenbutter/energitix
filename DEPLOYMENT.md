# Deployment

- **Repository:** https://github.com/goldenbutter/energitix
- **Production branch:** `main`; Git integration is connected and pushes deploy automatically.
- **Preferred Vercel project:** [iBithun / energitix](https://vercel.com/i-bithun/energitix)
- **Project ID:** `prj_18PbXbA735aAwP3KTsUnRr3qkgni`
- **Team:** `i-bithun`
- **Project fallback:** https://energitix-three.vercel.app
- **Canonical website:** https://energitix.ibithun.com
- **Video player:** https://energitix.ibithun.com/teaser.html
- **Framework:** Vite / static React site
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Output:** `dist`
- **Application secrets / environment variables:** none required

## Domain and project ownership

The canonical hostname is **energitix.ibithun.com**, matching the **ENERGITIX / energitix** brand and repository. Website metadata, teaser links, README links and the generated OG card use this spelling.

**Completed 29 October 2026:** both custom hostnames are verified on `i-bithun/energitix`. The canonical hostname serves production over HTTPS. The earlier **energetix.ibithun.com** spelling returns a permanent HTTP 308 redirect to the canonical hostname, preserving paths and query strings. The homepage, teaser and OG image returned HTTP 200 at the corrected address.

The original `goldenbutters-projects/energitix` duplicate was deleted after moving the legacy hostname, confirming the redirect and verifying the iBithun production site. This completes the user's previously authorized cleanup. The local checkout remains linked to the iBithun project. The old `energitix.vercel.app` duplicate URL is retired; use the canonical hostname or `energitix-three.vercel.app` fallback.

## External DNS

Hostinger manages the zone through `apollo.dns-parking.com` and `athena.dns-parking.com`.

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `energitix` | `11371a23cb8cfe44.vercel-dns-016.com` | 3600 |
| TXT | `_vercel` | `vc-domain-verify=energitix.ibithun.com,f81238940553480a8b60` | 3600 |
| CNAME | `energetix` | `11371a23cb8cfe44.vercel-dns-016.com` | 3600 |
| TXT | `_vercel` | `vc-domain-verify=energetix.ibithun.com,14b6d3f798b6e8fe4afa` | 3600 |

The two corrected-hostname records were added through the existing signed-in Hostinger session. Authoritative DNS and Vercel verification confirmed them. The legacy CNAME remains necessary for previously shared links to reach the redirect. Unrelated records, nameservers and parent-domain ownership were preserved.

```sh
vercel domains verify energitix.ibithun.com --project energitix --format=json --scope i-bithun
```

## Web Analytics

Web Analytics is enabled on `i-bithun/energitix`. The official `@vercel/analytics` SDK is bundled into both Vite HTML entries, the homepage and teaser. [Open the dashboard](https://vercel.com/i-bithun/energitix/analytics).

Production verification on 28 October 2026 recorded one real browser view for `/` and one for `/teaser.html` on `energitix-three.vercel.app`, confirmed through Vercel's metrics API. Headless browser visits were filtered by the vendor script as intended. As of 29 October 2026, the corrected custom hostname serves the iBithun project with the same analytics integration. Automated headless checks are not evidence of counted visitor events.

```sh
vercel metrics vercel.analytics.page_view.count --since 1h --group-by requestPath --project energitix --environment production --scope i-bithun
```

Keep `i-bithun/energitix` as the sole project for this website. The parent `ibithun.com` domain ownership remains unchanged.

## Verification

The OG card and metadata are live on the custom domain. Requests using Facebook and LinkedIn crawler user agents retrieved the homepage and teaser metadata and the 1200 × 630 JPEG successfully with HTTP 200. The metadata is included in the initial HTML and does not require JavaScript.

Domain-correction checks on 29 October 2026 passed at desktop and mobile widths with correct canonical metadata, no browser errors and no horizontal overflow. HTTPS, homepage, teaser, OG image and legacy redirects were also checked. Screenshots are in ignored `analysis/domain-correction/`.

Earlier visual regression checks passed at 1440 × 900 and 390 × 844 with 32 screenshots, no browser errors or horizontal overflow, working demo bag controls and reduced-motion checks. Focused film tests and the 72-comparison lettering suite are documented in `TESTING.md`. Temporary receipts and screenshots stay in ignored `analysis/`.

Vite may report an advisory about the Three.js chunk being larger than 500 kB; this does not fail the build.
