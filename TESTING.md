# Visual regression verification — 28 October 2026

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
