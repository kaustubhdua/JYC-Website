# V64 — JYC Editorial System Research & Next Plan

Date: 2026-10-08

## What changed in this pass

- Added a shared public editorial navigation layer.
- Added a compact current-page context line.
- Added an automatic desktop section index for long public pages.
- Added active-section tracking with IntersectionObserver.
- Added route progress feedback.
- Added restrained card/image hover polish.
- Added explicit focus-visible treatment.
- Added reduced-motion fallbacks.
- Added a dedicated QA contract and package script: `qa:editorial`.
- No new UI dependency was introduced.

## Research basis

### JIIT references

CICR is strongest as an organisation-first reference: identity, innovation/learning capability, projects, community, upcoming events, past events and contact.

Innovation JIIT is strongest for the organisation → activities → upcoming events → archive → flagship experience pattern.

### Fest references

Concetto 2026 demonstrates a date-based timeline where users select a day and then see the programme for that day. It also separates event discovery from the timeline.

Thomso 2026 demonstrates a large event directory grouped by category and day, with concise participation metadata and a dedicated FAQ.

Sangram 2026 demonstrates a strong live-state hierarchy: countdown, live results, sport/category groupings, archive, people and sponsors.

### Open-source / interaction references

Motion provides layout and shared-element transitions through `layout` and `layoutId`, which are appropriate for event-card → detail and gallery-card → lightbox transitions.

Radix provides accessible interaction primitives that can be combined with Motion for animated dialogs, accordions and tabs.

Embla provides a minimal viewport/container carousel architecture suitable for photo rails without imposing a visual identity.

React Bits and Aceternity remain component-pattern sources only; JYC should cherry-pick restrained interactions rather than copy their aesthetic.

## What should happen next

1. **Event detail transition pass**
   - Connect featured event/card imagery to event-detail imagery with Motion shared transitions.
   - Keep reduced-motion fallback.

2. **Gallery shared transition pass**
   - Connect gallery cards to the lightbox.
   - Preserve keyboard focus, swipe, zoom and deep-link behaviour.

3. **Event timeline pass**
   - Add a reusable day selector for multi-day fest/event experiences.
   - Keep normal JYC events chronological and lightweight.

4. **Society detail pass**
   - Give each society a richer editorial page: identity, what they do, activities, events, people, photographs and official links.
   - Use only verified hub-source material.

5. **Responsive image delivery**
   - Complete AVIF/WebP responsive variants with `srcset` and `sizes`.
   - Verify real mobile transfer/performance.

6. **Visual cleanup**
   - Audit historical CSS layers and remove only confirmed-unused generations.
   - Continue extracting high-cohesion sections from the large public shell.

7. **Manual browser QA**
   - Test 320px, 390px, 768px, 1024px, 1440px and large desktop.
   - Test keyboard navigation, focus return, reduced motion, zoom, light/dark mode and slow network.

8. **Production gates**
   - Keep Vercel deployment blocked status honest until quota clears.
   - Finish Supabase leaked-password protection manually.
   - Complete gallery rights clearance/focal review before publishing CMS photos.
   - Complete backup/restore drill before declaring operational release.

## Design rule

JYC should remain an editorial student-organisation website. Motion, carousels, 3D and animated components are subordinate to real people, real communities, real events and real photography.
