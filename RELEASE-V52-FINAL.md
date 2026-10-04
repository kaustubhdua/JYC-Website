# V52 — Final JYC Club-Only Production Release

## Release intent

V52 is a stabilisation release, not a product expansion. The public product is the official JIIT Youth Club 128 organisational website.

### Public scope

- Home
- About JYC
- History
- Clubs / Hubs
- Club detail
- Events
- Event detail
- Fests / flagship JYC experiences
- Gallery
- Archive
- Leadership / Team
- Achievements
- Recruitment
- Announcements / JYC Now
- JYC Event Calendar
- Contact
- Search, sharing, accessibility and responsive behaviour

### Explicitly outside the public product

- Academic calendar / academic utilities
- My JYC / student accounts
- Attendance or check-in
- Event-pass / certificate systems
- Campus utility dashboards
- Student-help workflows
- Public social-network features
- Public assistant/chat surfaces
- Intrusive popups or decorative WebGL systems

## Final visual contract

The public UI uses the senior-approved JYC logo system: deep navy, champagne, ivory and restrained neutrals. The experience is centred, compact, editorial and photography-led.

Motion is purposeful:
- short reveal transitions
- restrained hover lift
- logo-led hero micro-interaction
- no orbit rings
- no flying bird
- no custom cursor
- no persistent decorative rotation
- reduced-motion support

## Source-first content contract

The public app continues to use the maintained JYC source-media pipeline and supplied hub material. Historical/source material is not silently treated as a current exhaustive roster. Current publication remains controlled through the private JYC publishing workflow.

## Final QA contract

The release suite covers:
- source integrity
- search
- security
- SEO
- build preflight
- production contracts
- runtime and functional contracts
- senior visual contract
- data integrity
- accessibility
- repository hygiene
- final V52 public-scope and local-media integrity checks

CI additionally runs:
- npm audit
- full static QA
- Vite production build
- Playwright browser QA
- performance budget
- CodeQL

## Deployment

The GitHub repository and CI gates are the source of truth for the release. Production deployment should still be checked separately after Vercel publishes the final commit.
