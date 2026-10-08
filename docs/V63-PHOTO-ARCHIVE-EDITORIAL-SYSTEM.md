# V63 Photo Archive Editorial System

This release turns the JYC gallery from a presentation-only photo wall into an editorial archive workflow.

## What changed

- Editorial scoring rubric: composition, people/moment, JYC relevance, technical quality, uniqueness and story value.
- Diversity-aware ranking with association/family penalties so one club or one photo type cannot dominate every featured selection.
- Focal-point editor with live 16:9, 1:1 and 3:4 previews.
- Editorial states: unreviewed, shortlisted, featured, archive, rejected.
- Album editorial states: draft, curating, ready, published, archived.
- Album narrative/story fields and explicit cover-gallery relationship.
- Publication guard now requires linked approved photos, cleared rights, resolved provenance, focal points, a narrative and editorial readiness.
- Responsive picture delivery with AVIF/WebP srcset and sizes.
- Sharp-based build derivative generator and a separate perceptual duplicate/technical-quality audit.
- Gallery information architecture for Moments, Collections, Years and Communities.
- Signature Photo Story using Motion layout/enter/exit patterns with reduced-motion fallback.
- CMS photo workbench for metadata, scoring, album assignment and focal points. It never changes rights state automatically.

## Open-source UI patterns used as references

The implementation deliberately reuses the project's existing Motion dependency instead of adding another animation system. Motion's layout and AnimatePresence patterns informed the Photo Story transitions and state changes.

Embla's lightweight overflow/scroll-container model informed the horizontal collection rail and thumbnail scrubber.

Responsive photo-album projects informed the aspect-ratio-preserving gallery approach and separation of layout from the image renderer.

Radix Primitives informed the accessibility expectations for future modal/editor primitives: keyboard navigation, focus management, semantic labels and restrained animation.

## Important editorial boundary

The code does not infer rights, invent photographer credits, or auto-publish photos. The live production state remains:

- 52 gallery records
- 52 rights-review records
- 52 editorial-unreviewed records
- 52 missing focal points
- 31 draft albums

Those are intentional queues for human editorial work.

## Commands

- npm run media:audit — generate public/photo-intelligence-report.json with dimensions, technical signals, binary hashes and perceptual near-duplicate groups.
- npm run qa:photo-intelligence — verify the photo architecture contracts.
- The normal build generates web derivatives before the image manifest.

## Standards used

- MDN responsive images: srcset, sizes, picture
- MDN object-position for editorial focal framing
- W3C WAI Images Tutorial for alternative text
- IIIF Image API as an architectural reference for future region/size transforms
- Dublin Core / Library of Congress preservation principles for separating creator/date/rights/technical metadata from presentation
