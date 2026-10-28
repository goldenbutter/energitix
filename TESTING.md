# Visual regression verification: 28 October 2026

## Film-entry defect

The video can silhouette was applied to the headline even before the film canvas became visible. During the incoming 3D transition, this erased letters at a position where no visible can existed. The original code failed the new regression check immediately at the 320 × 693 film entrance.

The fix removes headline masking entirely. The normal-blend solid product layer provides occlusion. Image frames and product mattes are published together only after decoding, and the 3D model follows the film's actual visibility so it remains available during delayed loading.

## Automated checks

Run against the corrected local application with Playwright 1.64.1:

- Chromium and WebKit: 320 × 693, 390 × 844, 430 × 932, 768 × 1024, 844 × 390, 1440 × 900 and 1920 × 1080.
- 13 film positions in each direction: 364 transition samples total.
- 14 pixel comparisons: entering title matches its complete, unoccluded reference.
- 4 delayed-matte scenarios: normal and reduced motion in both engines; the 3D fallback stays visible until both video layers are ready.
- 6 resize states: 390 × 844 → 844 × 390 → 390 × 740 at device pixel ratio 2, in both engines.
- No horizontal overflow or browser exceptions in the focused checks.
- Full-page checks: 32 desktop/mobile screenshots, pack pricing, bag quantity/subtotals, removal, Escape dismissal and reduced-motion rendering. No browser errors.
- Production build passes; Vite retains its existing advisory about the Three.js chunk exceeding 500 kB.

Representative entry, playback, exit and reverse-scroll screenshots were visually reviewed, along with the full-page contact sheet. These are browser tests, not a physical iPhone/Android device certification.

## Reproduce

```sh
npm ci
npx playwright install chromium webkit
npm run dev
# In another terminal:
npm run test:film
npm run test:visual
```

Use `BASE_URL=https://energetix.ibithun.com` to target production. `FILM_ENGINES=chromium` or `FILM_ENGINES=webkit` selects an engine; `FILM_SPECIAL_ONLY=1` runs only loading and resize cases. Screenshots and JSON reports are stored in ignored `analysis/`.

## Splash lettering and teaser speed follow-up

The multiply-blended liquid previously sat above the headline, changing the ivory letter pixels as the splash moved. The liquid now sits below the headline; the solid can remains above both. The headline opacity stays constant.

- The original splash frame 100 changed 6,568 of 28,869 sampled solid letter pixels (22.75%). The same frame passes after the fix with zero changed letter pixels.
- An 18-frame sweep passed in Chromium and WebKit at 1440 × 900 and 390 × 844: 72 screenshot comparisons sampling both black and ivory letters, with zero changed solid-letter pixels.
- Entry/exit regression checks were repeated in both engines at desktop and phone widths, including reverse scrolling, delayed media, reduced motion and mobile resizing; all 10 cases passed.
- Teaser MP4 encoding applies `setpts=PTS/1.4` after removing capture stalls. The README GIF derives from that sped-up MP4; the live website's scroll speed is unchanged. The fresh live-site recording is 37.67 seconds at 1600 × 900 / 30 fps and decoded without errors. The recording reported no page errors, and sampled splash frames retain steady lettering.

Run `npm run test:splash` with the Python asset environment installed. Its screenshots and pixel-count report go to `analysis/splash-verification/`.

## Supplied 20-second teaser

The published teaser now uses the supplied `REC-20261028124110.mp4`, renamed to `energitix-desktop-teaser.mp4` without retiming or re-encoding. Metadata: 20.333 seconds, 1298 × 1060, H.264, 30 fps, no audio. Poster and GIF were regenerated from this file; the standalone player preserves its proportions.

The production build and full MP4 decode passed. Chromium and WebKit playback passed at 1440 × 900 and 390 × 844: correct duration and dimensions, default playback rate 1, no horizontal overflow or page errors. Player screenshots are in ignored `analysis/teaser-recording/selected-*.png`.

## Social sharing metadata

The production build passes with static Open Graph and Twitter large-image metadata on both the homepage and teaser player. Both pages reference the dedicated HTTPS JPEG and declare image width, height, MIME type and alt text. The card was visually reviewed and its JPEG decoded successfully at 1200 × 630 (142 KB). The generation script waits for the exact brand assets and self-hosted font before capture.


## Web Analytics integration

Installed `@vercel/analytics` 2.0.1 and shared its initialization between the homepage and the standalone teaser. The teaser is now a Vite HTML entry so both pages consume the same built analytics module. The production build passes. Browser checks at 1440 × 900 and 390 × 844 confirmed one analytics script load per page, no browser errors, no failed application assets, no horizontal overflow and no em dashes in rendered text. Local checks intercepted the vendor script; live collection is verified separately after deployment.
