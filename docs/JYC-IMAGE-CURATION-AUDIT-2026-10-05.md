# JYC Image Curation Audit — 2026-10-05

## Scope

The committed source archive contains 873 raw image entries: 872 raster images and 1 SVG, representing 813 unique binary sources after exact duplicate reconciliation. The archive was visually reviewed as contact sheets before this pass.

The important rule is **not** to flatten the archive into one undifferentiated gallery. The images contain very different material:

- real campus/event photography
- club/team photography
- stage and performance photography
- sports/action photography
- fest/cultural photography
- technical/project/workshop photography
- posters, presentation slides and event graphics
- club identities/logos
- QR/social/contact cards
- textures, paper, frames and decorative fragments
- illustrative/stock-style supporting graphics

The last categories remain useful as source material, but they are not treated as ordinary photographs.

## Visual subject map

| Source collection | What the visual audit shows | Best website role |
|---|---|---|
| Abhivyakti | Theatre scenes, dancers, performers, rehearsal/stage photographs, large student groups | Club detail story, performance sections, gallery |
| Arcadia | Community portrait material plus designed visual assets | Club detail / visual identity |
| Aura | Small community/identity set | Club detail, not homepage hero |
| BDS | Student/community group photography | Club detail / gallery |
| CICR | Robotics/technical project slides, technical-head profiles, project/event graphics | Club detail evidence and project/story panels |
| Cinekala | Film-strip layouts, camera/film society material | Club detail, film/media story |
| CypherX | Cybersecurity illustrations, workshop graphics and some real people | Club detail; use real people where available and graphics as supporting context |
| Dronotics | Drone imagery, engineering visuals, competition moments, student groups | Club detail and Dron-O-War event visuals |
| Eloquence | Literary/cultural presentation material | Club detail / literary identity |
| Innovation | Hackathon/workshop/event slides plus real event/group photography | Club detail, innovation event context |
| JODC | Open-source/developer presentation material and workshop photos | Club detail / technical story |
| Neural Nexus | AI/learning graphics, portraits, social cards and community material | Club detail / AI-learning story |
| Panache | Fashion photography, portraits, editorial black-and-white photography, creative work | Club detail and cultural/fashion gallery |
| Prismatic | Graphic-design/fine-art visuals | Club detail / design story |
| RPH | Coding/hackathon/career material, classroom/auditorium photographs and placement achievements | Club detail / technical-career story |
| VamUnique | Fashion/dance/cultural groups and event material | Club detail / cultural gallery |
| Zencoders | Developer community groups, portraits and programming identity | Club detail / technical community story |
| Aakriti | Festive decor, art-making, cultural performances, groups and campus celebration | Fest/archive and cultural homepage moments |
| Campus events | Singing, speaking, stages, groups, campus gatherings and student-life moments | Homepage photo story, gallery, archive |
| Sports | Football, basketball, badminton, chess, table tennis and other action photography | Sports identity, gallery, homepage diversity |

## Usage rules implemented

### 1. Homepage

The photo-story sequence now uses a diversity-aware editorial ordering. It deliberately rotates between campus life, festivals, performance, drones/engineering, innovation, sports, fashion/photography, developer communities and AI/learning before falling back to the full source archive.

This prevents the homepage from becoming 20 consecutive images from the same source presentation while still keeping the full archive available.

### 2. Club pages

Club pages continue to draw from the source hub media system and therefore receive their own source-backed visual pool.

Examples:
- Abhivyakti → performance/stage/group imagery
- Dronotics → drones, engineering and competition imagery
- Panache → fashion/editorial photography
- CypherX → cybersecurity imagery and workshop context
- Innovation → hackathon/workshop/project material
- Neural Nexus → AI/learning imagery
- Zencoders/JODC → developer/open-source material
- Sports → actual sports action

### 3. Event pages

Event imagery remains conservative.

Only archive material with a strong source-level relationship to the event is attached automatically. In this pass:
- Dron-O-War can use explicitly named Dronotics event assets and strongly related Dronotics photography.
- CodeAI/RIDE can use selected Innovation source material where the source package itself is Innovation event/project material.
- Generic campus photography is **not** relabelled as a specific event.

Flagship events with existing official/fallback imagery keep those explicit sources.

### 4. Gallery

The Gallery retains the complete source-backed photography pool rather than replacing it with a small curated subset.

Decorative assets, QR codes, logos, presentation slides and obvious graphics remain in the archive but are not promoted as ordinary photography.

### 5. Provenance

The system does not infer a photograph's year merely because the current site is 2026. Unknown years remain unknown.

## Design direction

The visual direction follows the existing JYC editorial principle:

**photography + typography + whitespace + thin borders + real information**

The archive is treated more like a student publication/photo record than a generic image grid.

The implementation deliberately avoids:
- invented event photography
- stock images pretending to be JYC photographs
- assigning a campus photograph to the wrong event
- using QR codes as hero imagery
- using presentation slides as if they were photographs
- flooding the homepage with every archive asset
- throwing away the complete archive just to make the homepage look curated

## QA

The runtime QA suite now verifies that:
- the explicit archive subject map exists;
- the diversity-aware curation function exists;
- the homepage Photo Story consumes the curation layer;
- event media can consume strongly source-named archive material;
- source archive years are not fabricated.

The complete archive remains available for the public Gallery and source provenance layer.