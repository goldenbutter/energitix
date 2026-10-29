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

## Two Vercel projects

The original deployment was created in `goldenbutters-projects`. A second import of the same GitHub repository exists in `i-bithun`. Both were confirmed to receive commits from `main`. This explains why the original domain was absent from the newly imported project's dashboard. The local checkout is now linked to `i-bithun/energitix` for future CLI operations. The user has authorized deleting the original `goldenbutters-projects/energitix` duplicate after the custom domain is working on iBithun Pro. Deletion is pending the domain verification blocker below; removing it first would interrupt the custom hostname.

## Domain spelling and external DNS

On 29 October 2026 the canonical hostname was corrected to **energitix.ibithun.com**, matching the **ENERGITIX / energitix** brand and repository. The earlier **energetix.ibithun.com** spelling is a legacy address. Website metadata, teaser links, README links and the generated OG card use the corrected spelling.

Hostinger manages the zone through `apollo.dns-parking.com` and `athena.dns-parking.com`. Vercel requires these records for the corrected hostname in the iBithun project:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `energitix` | `11371a23cb8cfe44.vercel-dns-016.com` | 3600 |
| TXT | `_vercel` | `vc-domain-verify=energitix.ibithun.com,f81238940553480a8b60` | 3600 |

**Status, 29 October 2026:** the corrected hostname is attached to `i-bithun/energitix`, but its CNAME and verification TXT are missing. Hostinger sign-in is needed to add them. Preserve the existing legacy CNAME and unrelated TXT, mail and domain records. After the corrected hostname passes verification and HTTPS checks, redirect the legacy address to it so existing links keep working.

The legacy hostname remains verified on `goldenbutters-projects/energitix` and serves the site while the corrected domain is configured. Do not delete that project before the corrected domain works and the legacy redirect has a verified replacement binding.

Recheck the corrected hostname with:

```sh
vercel domains verify energitix.ibithun.com --project energitix --format=json --scope i-bithun
```

Do not change the parent domain's ownership, nameservers or unrelated DNS records to resolve this project-specific configuration.

## Web Analytics

Web Analytics is enabled on `i-bithun/energitix`. The official `@vercel/analytics` SDK is bundled into both Vite HTML entries, the homepage and teaser. [Open the dashboard](https://vercel.com/i-bithun/energitix/analytics).

Production verification on 28 October 2026 recorded one real browser view for `/` and one for `/teaser.html` on `energitix-three.vercel.app`, confirmed through Vercel's metrics API. Headless browser visits were filtered by the vendor script as intended. The custom hostname still serves the original team until the handover is verified, so those visits do not yet feed the iBithun analytics project.

```sh
vercel metrics vercel.analytics.page_view.count --since 1h --group-by requestPath --project energitix --environment production --scope i-bithun
```

After the custom hostname is verified on iBithun, confirm HTTPS and analytics there before deleting only `goldenbutters-projects/energitix`. Do not delete the iBithun project or transfer ownership of the parent `ibithun.com` domain.

## Verification

The OG card and metadata are live on the custom domain. Requests using Facebook and LinkedIn crawler user agents retrieved the homepage and teaser metadata and the 1200 × 630 JPEG successfully with HTTP 200. The metadata is included in the initial HTML and does not require JavaScript.

Earlier visual regression checks passed at 1440 × 900 and 390 × 844 with 32 screenshots, no browser errors or horizontal overflow, working demo bag controls and reduced-motion checks. Focused film tests and the 72-comparison lettering suite are documented in `TESTING.md`. Temporary receipts and screenshots stay in ignored `analysis/`.

Vite may report an advisory about the Three.js chunk being larger than 500 kB; this does not fail the build.
