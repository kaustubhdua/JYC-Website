# Google Search readiness

## What is implemented

The public site is prepared for Google Search with:

- a canonical production origin;
- crawlable public routes;
- robots.txt with a sitemap declaration;
- generated sitemap.xml containing maintained public routes and source-backed club URLs;
- Organization, WebSite, BreadcrumbList, CollectionPage and Event structured data where applicable;
- route-specific canonical URLs, titles and descriptions;
- Open Graph/Twitter metadata;
- large image previews for public pages;
- a Google Search Console verification meta slot.

Google's Sitelinks Search Box / SearchAction feature is intentionally not emitted. Google retired that search-result feature in November 2024, so old markup would not improve Search appearance.

## Activate Search Console verification

1. Open Google Search Console.
2. Add the production website as a Domain property when possible.
3. If using URL-prefix verification, choose HTML tag verification.
4. Copy only the verification token.
5. Set VITE_GOOGLE_SITE_VERIFICATION=<token> in the production Vercel environment.
6. Redeploy the site.
7. In Search Console, verify the property.
8. Submit https://<production-domain>/sitemap.xml.
9. Use URL Inspection on the homepage and important public pages.

Do not commit the verification token to source control. It is not a password, but deployment configuration keeps domain-specific values out of the repository.

## V1 search boundary

The website's own search remains a fast client-side discovery tool for published JYC content. It is not a Google-powered search box and does not load an external search SDK. This keeps typing responsive and avoids network latency or third-party UI in the public V1 experience.

## V1 product boundary

Google Search should discover the official organisational website:

Identity → About → Leadership → Clubs/Hubs → Events → Gallery → Announcements → Contact

It must not expose or promote the private Control Center, student accounts, academic utilities, attendance, passes, certificates or other excluded V1 surfaces.

## Final validation

After deployment, verify Search Console, sitemap acceptance, indexability, canonical URLs and structured data on real production pages. Confirm private routes are not promoted and obsolete SearchAction markup is absent.

Google controls indexing and search appearance; repository changes can make the site technically ready but cannot guarantee a particular ranking or rich-result placement.
