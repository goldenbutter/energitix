# Master prompt: 3D product scroll-animation website

Reusable template for any product. The supplied prompt is preserved below with cleaned pasted line breaks and Markdown headings. Fill in the project brief before using it; keep this template for future products.

## Current project brief: approved direction

| Field | Current value / decision needed |
| --- | --- |
| Brand `[BRAND]` | ENERGITIX, from the supplied can label |
| Product `[PRODUCT]` | ENERGITIX Original, illustrative citrus flavour |
| Tagline `[TAGLINE]` | Bring the energy. |
| Prices `[PRICES]` | NOK 35 per can; illustrative 6-pack NOK 210 and 12-pack NOK 420 |
| Footer `[benefit]` | Stay curious. Stay energised. |
| Website language | English |
| Global copy rule | Never use em dashes in websites or outbound emails. This includes page titles, UI copy, metadata, social previews, alt text and public documentation. Rewrite sentences or use appropriate commas, colons or full stops. |
| Wordmark treatment | Reconstructed artwork based on the can’s original slanted silver/orange lettering and lightning underline; use the transparent asset, not a substitute typeface. |
| Creator portfolio | https://portfolio.ibithun.com |
| LinkedIn | https://www.linkedin.com/in/bithun-chatterjee |
| Contact email | bithun@ibithun.com, verified on the main iBithun website |
| Publication plan | Future subdomain under ibithun.com; user will commission the main-site project listing separately. |
| Product claims and three stats | Fictional portfolio concept. Illustrative 330 ml size; no nutritional or performance claims. |
| Shop behaviour | Interactive demo cart only; no orders or payments |
| Product image | `bottle.png` |
| Commercial video | `Energy_drink_commercial_liquid_e…_b5ce69df.mp4` |
| Video metadata | 8 seconds, 1280 × 720, 24 fps, 192 frames; audio present |
| Geometry mode | Mode A: rotational aluminum can |
| Site palette | Warm ivory `#f6f3eb`, near-black `#171713`, vivid orange `#f56b19` |
| Palette interpretation | Creative freedom approved. Three principal interface colours; preserve multicolour product artwork and video. |

The current brief is separate from the reusable instructions below. The user approved building a localhost portfolio demo for client presentations and LinkedIn promotion. Flavour, size and pack options are illustrative creative choices.

## Reusable prompt

You are a senior creative developer. Build a luxurious, award-level product landing page in which ONE 3D product travels through every section of the site as the visitor scrolls. It should feel like watching a premium ad, not reading a website. I am uploading: PRODUCT IMAGE: one high-resolution photo of my product (ideally front view, plain/light background). AD VIDEOS (1–2 short clips, 2–8 s): e.g. the product turning, a splash, a reveal or a burst. Optional: brand name = [BRAND], product name = [PRODUCT], tagline = [TAGLINE], price(s) = [PRICES]. If any optional detail is missing, write short, plausible copy that fits the product and mark prices as placeholders.

## Tech stack and deliverable

Vite + React 18 + Three.js + GSAP (ScrollTrigger) + Lenis smooth scroll. Use relative asset paths (vite base './'). Deliver a complete project folder that runs with `npm install` then `npm run dev` , plus a README. Process all assets yourself with Python (Pillow, NumPy, SciPy) and ffmpeg. Look at the image and at video contact sheets before you design anything.

## 1. Analyse the assets first

a) Product shape. Decide which mode applies: MODE A, "ROTATIONAL" : the product is round in cross-section (can, bottle, jar, tube, cup, candle, perfume bottle, cosmetic tube). Build a REAL 3D model (section 3A). MODE B, "NON-ROTATIONAL" : anything else (shoe, watch, headphones, phone, bag, gadget). Build a depth-driven 3D cut-out (section 3B). b) Palette. Extract EXACTLY THREE colours from the product and use only these across the whole site: --light: a soft near-white with a slight hue bias toward the accent (light backgrounds). --dark: the product's darkest dominant colour (dark sections, text). --accent: the product's most vivid colour (CTAs, glows, highlights). No other hues anywhere, including pink, purple or blue unless the product itself is that colour. Tints are allowed only as opacity mixes of these three. c) Videos. Read fps, frame count and duration (ffprobe). Make contact sheets. Note where the product sits in each frame (centre x, centre y, full height including caps, lids and bases) on the first frame.

## 2. Asset processing

Product cut-out: remove the background cleanly (geometric mask or careful keying). Never eat into silver or white parts of the product. Check the edges on dark and on accent backgrounds. HQ close-ups: crop 2 macro details from the product photo (texture, cap/lid, droplets, stitching, dial, logo) for the close-up section. Video frames: extract every frame to WebP (quality about 86). Grade the studio background to pure white (colorlevels) and add slight saturation. Colour-match the video product to the photo product: histogram-match each RGB channel using pixels inside the product region (photo cut-out vs. first video frame), protecting near-white so the background stays white. Then nudge vivid hues toward the photo 's hue if needed. Verify with side-by-side crops; the product must look the same in the 3D model and in the video. Extract the video 's audio to MP3 for an optional sound toggle.

## 3A. Mode A: real 3D model (rotational products)

Measure the silhouette from the photo: body radius, neck/shoulder taper, cap/lid height, base taper. Express everything in body-radius units. Body: THREE.LatheGeometry (160 segments, phiStart = -π) with a custom UV v based on height, so the label maps linearly. Label texture: unwrap the photo onto a cylinder (u → angle θ, v → height). Sample photo x = cx + r(h)·sin θ, and y = h + k(h)·r·cos θ, where k is the ellipse ratio of the top/bottom rims (it varies with height because of perspective). Use the front ±60° . DESIGN a matching back (same graphic language: stripes, flames, patterns, drops) and blend it into the front with a soft cross-fade, so the product can spin 360° without showing smeared pixels. Caps, lids, rims, bases and pull-tabs: separate lathe or extruded meshes in metal or plastic (MeshStandardMaterial, correct metalness and roughness, DoubleSide). Label material: MeshPhysicalMaterial (map + a low-intensity emissiveMap of the same texture so colours stay vivid, clearcoat about 0.85, low envMapIntensity about 0.3 so darks stay deep). Lighting: RoomEnvironment through PMREM for reflections, a key light, a rim light and soft ambient. ACES tone mapping, sRGB output. Group hierarchy: placement + roll → pitch → yaw (spin about the product's own axis) → model (centred).

## 3B. Mode B: depth 3D (non-rotational products)

Use the cut-out as a texture on a finely subdivided plane. Generate a depth map (soft distance transform of the alpha, plus luminance cues, blurred) and displace the vertices so the product has real relief. Allow yaw/pitch of about ±35° , with a moving specular highlight across the surface and rim light, so turning reads as 3D, never like flat paper. Replace full spins with "swings" (rotate toward ±30° and back) plus scale/z-depth moves toward the camera.

## 4. The signature: one product travels through all sections

Render one fixed full-screen transparent WebGL canvas (z-index above sections, pointer-events: none). World units = CSS pixels at z = 0 (PerspectiveCamera with FOV 30, positioned at z = H/2 / tan(15°)). Every section contains an invisible SLOT div (correct aspect ratio for the product) with data attributes: data-yaw (in TURNS, cumulative), data-rot (roll°), data- pitch (°), data-glow, data-shadow, data-particles, data-dark (particle style on dark/accent grounds), data-idle (gentle sway while parked). Each frame, read every slot's getBoundingClientRect. Find slot i where the slot centre has just passed the viewport centre and slot i+1 is next. raw = progress between them, e = easeInOutCubic(raw), fly = sin(raw·π). Interpolate x, y, height, yaw, pitch and roll with e. Then add, during flight: z toward the camera (fly·0.14·H), pitch tumble (+fly·0.42), roll lean in the travel direction (+fly·0.2), slightly larger scale. Remove the floor shadow mid-flight. The product therefore lands exactly in each slot and does a full 3D spin (Mode A) or swing (Mode B) between sections. Smooth everything in the render loop (lerp about 0.16 per frame). Add velocity- based lean and a gentle bob. Add mouse parallax on the camera and product, disabled ("calm") inside pinned sections. Under-product extras: a soft elliptical floor shadow on light sections, and an accent radial glow behind the product on dark sections. Particles matched to the product, as an InstancedMesh with a custom shader, rising or drifting around the product and trailing it: drinks → carbonation bubbles (clear spheres, thin meniscus rim, pin-point highlight; dark rim on light grounds, white rim on dark/accent grounds; speed up with scroll velocity). beauty/perfume → soft mist motes; tech → fine light dust; food → crumbs or steam; fashion → fabric lint or light flecks. Never tinted "oil" bubbles; keep particles subtle.

## 5. Page structure (in this order)



### Preloader

a dark screen; a minimal outline of the product fills with the accent colour while a 000→100 counter runs (tied to the model and texture loading, minimum about 1.7 s). Then a clip-path wipe upward. The product drops in from above, spinning, as the hero letters rise with a 3D flip.

### Hero (light)

the nav sits INSIDE the hero only (not sticky). A giant brand word in the accent colour behind the product, auto-fitted to ONE line at 94% of the viewport width (measure the glyphs and set font-size after fonts load and on resize). The product is centred and big (about 76vh). Bottom-left: a two-line tagline. Bottom-right: a "Shop now" pill. The visitor can DRAG the product to spin it (with inertia, springing back). Background: warm studio, i.e. the light colour, a soft accent radial glow behind the product, a subtle floor gradient and fine grain. No rays, badges or stickers.

### Reasons (light, two columns)

the product lands left, tilted, with three benefit rows (icon in a dark circle, title, one line) on the right. Same warm-studio background, with the glow behind the slot.

### Anatomy (pinned about 360%, dark studio)

dark background with an accent spotlight from above, a faint dot grid and a glowing floor (put the backdrop in a sticky wrapper so it stays during the pin, with the section itself transparent above the canvas). The product turns to present 4 features one at a time (Mode A examples: tilt to show the top/cap → turn to a texture → spin to the back → tip to show the base). Each feature has a 3D hotspot point on the model that is PROJECTED to screen every frame: a pulsing accent dot plus a thin line to a label (title + one sentence) on the left/right. Only the active label is visible, and the dot hides when that point faces away. Keep the yaw offset persistent so leaving the section is seamless. On phones, show the label as a centred caption below the product.

### Close up (dark)

headline plus 2 HQ macro tiles (clip-path wipe in, slow zoom inside the frame). The product sits on the opposite side with an accent glow.

### Video section (pinned about 240%)

the ad video scrubbed frame-by-frame by scroll on a canvas (coarse-to-fine preloading, nearest-loaded frame fallback). Background: a vivid radial gradient (light centre → accent → slightly darkened accent at the edges) plus grain. The canvas uses mix-blend-mode: multiply so the white studio disappears. The 3D product must land EXACTLY on top of the video 's product (position and size computed from the measured frame-1 product box and the cover-fit scale). The video fades in underneath, then the 3D product switches off (and back on at the end). A short headline rises in letter by letter. An optional sound toggle in the nav plays the video 's audio when this section starts. If there is a second video, add a second pinned scene the same way.

### Feature / taste (accent background)

two giant marquee rows (one filled, one outlined) sliding in opposite directions with scroll and skewing with scroll velocity. The product parks centre with a strong tilt and gentle sway. Three stats in a row underneath.

### Shop (light)

the product lands left with a slow turntable sway. On the right: name, live price, a pack/size selector (segmented buttons), a quantity stepper and an "Add to cart" button. Clicking add bursts the particles outward and back.

### Footer (dark)

"Stay [benefit]." line + a round back-to-top button + a giant brand wordmark in the accent colour + a small links row.

## 6. Interaction and motion details

Lenis smooth scroll synced to the ScrollTrigger ticker. Nav links use lenis.scrollTo. Custom cursor (desktop with a mouse only): an outlined ring + dot. Over links and buttons it grows into an accent-filled circle showing a short word ("Shop", "Add", "Top"). Its colour flips for dark and accent sections. Magnetic buttons (they lean toward the pointer and spring back elastically). Variable display font (e.g. "Anybody" , with weight and width axes) for the giant hero and footer words; letters squeeze and thin near the pointer. Headings reveal line by line (masked lines rising with a slight rotate). Small elements stagger in. Respect prefers- reduced-motion. Full phone layout: single column, slots stacked above the copy, smaller product sizes.

## 7. Don'ts

No "scroll" hints, no side progress rails, no section counters (01/04), no rotating text badges, no heavy paragraphs. No sticky header. No circle/iris transitions between sections. No flat paper-like product: it must always read as 3D (perspective, light moving across the surface, real rotation). No colours outside the three-colour palette. No plain flat white sections (always use warm studio light, a glow, a floor or grain).

## 8. Quality check before you finish

Take headless-browser screenshots at about 15 scroll positions on desktop (1440×900) and on a phone (390×844), and fix anything wrong: the hero word sits on one line; the product lands in every slot and spins/swings in between; the anatomy hotspots track the right point; the video product colour matches the 3D product; the video hand-off has no size or position jump; there 's no hard seam between sections; text never collides with the product when it's parked; and there are no console errors. Then explain in 3 short steps how to run it.
