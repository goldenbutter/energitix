# ENERGITIX wordmark artwork

The user requested the lettering from the original generated can, rather than a substitute designer typeface. The lettering is generated artwork; there is no exact installable font associated with it.

The built-in image generation tool reconstructed a standalone transparent wordmark using `bottle.png` as its reference. It preserves the visual treatment: narrow forward-slanted block lettering, silver-white ENERGI, gold-to-orange TIX, charcoal edging, and a lightning underline. It is a reconstruction from the reference, not a pixel-exact extraction or a font.

## Assets

- `public/assets/energitix-wordmark-original.png`: untouched generated RGBA artwork.
- `public/assets/energitix-wordmark.png`: transparent PNG with excess empty margins trimmed.
- `public/assets/energitix-wordmark.webp`: optimized transparent website asset.

Used in the hero, footer, navigation and preloader. Preserve its aspect ratio and transparency; do not recreate it with a fallback font or force a fixed width/height ratio.

## Generation prompt

Use case: precise-object-edit / brand wordmark extraction. The attached image is the reference for the EXACT ENERGITIX wordmark on the can. Create a clean isolated reusable logo artwork of that lettering, not a new font or new logo design. Match the original narrow bold forward-slanted racing letterforms, cut angles, proportions and tight but readable spacing. Exact text ENERGITIX (E N E R G I T I X). ENERGI has silver-white fill, TIX has warm golden-yellow-to-orange fill as on the can, with a fine dark charcoal edge so the silver lettering remains visible on an ivory website. Preserve the original orange/gold lightning-bolt underline directly below the lettering. Remove the can, the surrounding circular graphics, the large background lightning bolt, condensation, all shadows outside the artwork and all photographic backgrounds. Flatten/unwrap the lettering to a clean frontal logo lockup; straight horizontal baseline with letters still leaning forward, no cylindrical curvature, no camera perspective. Crisp high resolution graphic edges, restrained metallic shading inside the letters similar to the original, readable counters. Wide landscape composition with logo filling approximately 90% of width and modest equal transparent padding. Truly transparent alpha background. No other text, no extra objects, no new ornaments. This is the wordmark from the attached can, faithfully reconstructed as standalone artwork.
