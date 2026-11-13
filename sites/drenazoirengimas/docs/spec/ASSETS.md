# Asset provenance

Built-in ImageGen generated the illustrative assets on 2026-10-19. They are not real customer cases. Original PNGs are retained here; optimized AVIF/WebP/JPEG outputs are in `public/images`. `scripts/optimize-images.mjs` deterministically recreates outputs.

Hero prompt: approved board as reference, recreate top-left panel background only; modern Lithuanian house in rain/blue hour, warm windows, lawn, dark roof, house right, ground cutaway with gravel/drainage pipe and subtle blue water route; dark navy left negative space for HTML. Wide full bleed, no text/UI/logo/watermark; marketing illustration, not engineering drawing. Source `hero-source.png`; outputs hero-{768,1440,1920}.{avif,webp} and og.jpg.

Problem prompts: natural-daylight documentary-style illustrative images, 4:3 landscape, no people/text/logo/watermark or claimed project:

- foundations-source.png: rainwater along damp foundation plaster.
- basement-source.png: empty damp concrete-block basement, small high window.
- yard-source.png: puddles in Lithuanian residential garden, lawn/mud/trees/house.
- groundwater-source.png: standing water in shallow trench, grassy property and clay layers.

Card outputs are 640×480 and 320×240 WebP. Brand mark, icons and water diagram are native SVG. Manrope comes from @fontsource-variable/manrope (font license in dependency). No competitor assets copied.

2026-10-19 pre-launch pass: WaterDiagram.astro replaced with an authored native SVG architectural cross-section, labelled foundation/soil/geotextile/gravel/perforated pipe/well and water direction. No stock diagram or invented project photo was used. Scoped CSS fixes the oversized caption droplet. Illustration explicitly does not prescribe depth, slope or final disposal design.
