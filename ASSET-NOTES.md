# Lid detail: transparent background and white rim lighting

The user requested removal of the white studio background from the first close-up and a thin white backlight to separate the black can from the dark website.

Edited with the built-in image generation tool, using `public/assets/macro-lid.webp` as the reference. The new artwork has actual transparent alpha. The original white-background crop remains available. The component's container is also transparent, preserving the dark section behind the cut-out. The close-up is displayed at a subtle −9° angle using CSS, with framing adjusted to retain the complete rim and keep the body cropped naturally at the bottom.

- Original generated edit: `public/assets/macro-lid-rimlit.png`.
- Optimized site asset: `public/assets/macro-lid-rimlit.webp`.

## Edit prompt

Precise background extraction and subtle lighting edit of this exact product close-up. Preserve the original camera angle, silver lid and pull tab, shape, black can, orange/gold graphics, condensation droplets and composition. Remove ONLY the white studio background outside the can and replace it with actual transparent alpha. Keep the silver lid and all white metallic highlights fully intact, not transparent. Add a very thin, elegant white backlight/rim light along the outside silhouette of the can's rounded shoulders and side edges, giving separation against a near-black website. It should look like a real narrow strip studio light from behind: crisp delicate white edge with minimal soft spill, NOT a thick outline, NOT a neon glow, no white halo background, no bounding rectangle, no floor or cast shadow. Keep the entire silver lid visible with a small transparent margin above and at the sides. This remains a close-up cropped through the can body at the bottom. Photorealistic commercial detail photograph, sharp condensation and metal. Do not redesign the can or add text or objects. Landscape composition matching reference.

## Mobile film edge treatment

The original commercial crops the splash at the top of its 1280 × 720 frames. The smaller mobile framing exposes that source border inside the page. `src/film.js` continues the upper 64 source rows into the available margin with a reflected edge and a white dissolve, which blends neutrally under the canvas multiply mode. This is a presentation effect, not recovered video content. It removes the hard horizontal cutoff while preserving the current product size and shared 3D/video alignment. The original frame assets are unchanged.


## Film headline layering

The splash canvas uses multiply blending, while a separate normal-blend canvas restores the original can pixels through the source-aligned mattes in `public/assets/can-masks/`. This solid product layer occludes both headline colours and preserves silver highlights. The headline itself is never masked: masking it with the video silhouette caused holes while the video was invisible and the travelling 3D model was elsewhere.

`scripts/prepare_can_masks.py` derives and temporally smooths the can silhouette. The matte fills interior white reflections instead of treating brightness as transparency; its outside contour is inset and feathered, and the lower rim follows each frame’s row bounds. The splash outside the can retains multiply blending.

A film frame becomes available only after its image and matte have both decoded. The 3D model follows the film canvas’s actual visibility, so delayed media retains the model instead of exposing an incomplete product layer. Transition regression coverage lives in `scripts/verify-film.mjs`.
