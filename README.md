# @trebired/seo

Route-level search and social metadata for Trebired sites: titles, canonicals, hreflang alternates, Open Graph, Twitter cards, JSON-LD, robots directives, `robots.txt`, and `sitemap.xml`.

The package owns what a route claims about itself to search engines and social crawlers, and computes that claim from one config plus per-route copy. Callers own the route table, the copy, the locale in effect, and the moment those tags reach the document. The package does not own head emission, HTML escaping of the document, favicons, theme color, web app manifests, security headers, analytics, or any tag a browser reads for rendering rather than for indexing.

## Install

Runtime support: Bun 1+.

```sh
bun i @trebired/seo
```

## Quick Start

```ts
import { buildRouteSeo, defineConfig, toShellMeta } from "@trebired/seo";

const config = defineConfig({
  forVersion: "0.2.0",
  site: {
    defaultLocale: "en",
    locales: ["en", "cs"],
    name: "Example",
    url: "https://example.com",
  },
  titleTemplate: "%s | Example",
});

const descriptor = buildRouteSeo(config, {
  description: "What this page is about.",
  locale: "en",
  path: "/",
  title: "Home",
});

const shellMeta = toShellMeta(descriptor);
```

`shellMeta` is `{ title, description, lang, links, metas }`, the exact shape `@trebired/bundler`'s static shell consumes.

## Concepts

### Ownership Boundary

SEO is metadata a crawler reads to decide how a URL is indexed and how it is presented in a result or a share card. Everything else that lives in `<head>` is a different concern with a different owner. This package draws that line explicitly, because the concerns were previously mixed.

This package owns:

- `<title>` and its template.
- Meta description.
- Canonical URL.
- `hreflang` alternates and `x-default`.
- Robots directives, as a `robots` meta tag and as an `X-Robots-Tag` header.
- Open Graph tags, including `og:locale` and `og:locale:alternate`.
- Twitter card tags.
- JSON-LD structured data.
- `robots.txt` and `sitemap.xml`.

This package does not own, and these belong elsewhere:

| Concern | Owner | Why it is not SEO |
| --- | --- | --- |
| `charset`, `viewport` | `@trebired/bundler` | Document correctness. Required whether or not a crawler exists. |
| Favicons, `theme-color`, web app manifest, `apple-touch-icon` | Application | Browser and operating system chrome. Changes how the site looks in a tab or on a home screen, never how it is indexed. |
| CSP, CORS, security headers | `@trebired/security` | Transport and execution policy. |
| Preload, prefetch, resource hints | `@trebired/bundler` | Loading performance. |
| Route table, page copy, translations | Application | Product content. The package formats it, the application authors it. |
| Head emission, escaping, tag ordering | `@trebired/bundler` | Rendering. This package returns data, never HTML for the document head. |

The dividing rule: `@trebired/bundler` owns head emission, this package owns head semantics. A tag is this package's concern when removing it changes how a crawler indexes or presents the URL, and nothing about how the page renders.

### Descriptor

`buildRouteSeo()` returns a `SeoDescriptor`, a plain data object. It holds `title`, `description`, `lang`, `canonical`, `robots`, `links`, `metas`, and `structuredData`. It contains no HTML. Consumers hand it to whatever renders their document.

### Locale Strategy

`localeStrategy` decides whether a site has one URL per route or one URL per route and locale.

- `"none"` is the default. Every locale shares one URL. No `hreflang` alternates are emitted, because alternates that all point at the same URL tell a crawler nothing.
- `"prefix"` puts non-default locales under `/<locale>/...` and emits `hreflang` alternates plus `x-default`.
- `"query"` appends `?lang=<locale>` and emits the same alternates.

A site serving both languages on a single URL keeps `"none"`. Emitting alternates for that shape is wrong, so the package refuses to do it.

## Configuration

Sites configure the package through `.trebired/seo/config.ts`.

```ts
import { defineConfig } from "@trebired/seo";

export default defineConfig({
  defaults: {
    description: "Used when a route supplies none.",
    image: { alt: "Example", height: 630, url: "/social-card.png", width: 1200 },
    robots: { index: true, follow: true },
  },
  forVersion: "0.2.0",
  localeStrategy: "none",
  robotsTxt: { disallow: ["/api/"] },
  site: {
    defaultLocale: "en",
    locales: ["en", "cs"],
    name: "Example",
    url: "https://example.com",
  },
  sitemap: { changeFrequency: "monthly", exclude: ["/404"], priority: 0.7 },
  titleTemplate: "%s | Example",
  twitter: { card: "summary_large_image", site: "@example" },
});
```

`site.name`, `site.url`, and `site.defaultLocale` are required. `normalizeConfig()` throws when one is missing, at build time rather than in a crawler's index.

`forVersion` is required and is checked against the installed package version through `resolveForVersion()` from `@trebired/utils`. A config written for an older minor line fails the build rather than applying stale defaults. Its position among the config keys does not matter; the check is a property lookup, not an ordering rule. Pass `configPath` to `normalizeConfig()` to name the file in the failure message, and `requireForVersion: false` to allow an absent value.

Per-route values override config defaults. A route passes `title`, `description`, `image`, `robots`, `type`, and `structuredData`; anything it omits falls back to `defaults`.

## Runtime

### Static Builds

`buildSitemap()` and `buildRobotsTxt()` return strings. A build writes them next to the generated HTML. `buildSitemap()` emits `xhtml:link` alternates per entry when `localeStrategy` is not `"none"`.

### Server Responses

`seoHeaders()` returns a `Link: <canonical>; rel="canonical"` header and an `X-Robots-Tag` header for a descriptor. `noindexHeaders()` returns `X-Robots-Tag: noindex,nofollow` for routes that must stay out of an index regardless of their markup. `canonicalRedirect()` compares a request URL against the configured origin and canonical path shape, and returns a 301 target when they differ, or `null` when the URL is already canonical.

### Structured Data

`renderStructuredData()` returns a complete `<script type="application/ld+json">` element. `serializeStructuredData()` returns the JSON payload alone. Both escape `</script` and `<!--` so page data cannot terminate the script element. `@trebired/bundler`'s static shell renders `<title>`, `<meta>`, and `<link>` only, so a static build places the returned element in the body, which is valid for JSON-LD.

## Public API

Config: `defineConfig`, `normalizeConfig`, `DEFAULT_ROBOTS`.

Routes: `buildRouteSeo`, `renderTitle`, `toShellMeta`, `mergeShellMeta`.

Robots: `robotsContent`, `robotsDirectives`, `robotsHeader`, `buildRobotsTxt`.

Sitemap: `buildSitemap`, `escapeXml`.

Structured data: `webSiteSchema`, `personSchema`, `organizationSchema`, `breadcrumbSchema`, `withContext`, `renderStructuredData`, `serializeStructuredData`, `escapeJsonLd`.

Server: `seoHeaders`, `noindexHeaders`, `canonicalRedirect`.

URLs: `absoluteUrl`, `localizedUrl`, `localizedPath`, `normalizeOrigin`, `normalizePath`.

Types are exported for every public surface, including `SeoConfig`, `SeoDescriptor`, `SeoRouteInput`, `SeoShellMeta`, `SeoSitemapEntry`, and `SeoStructuredData`.

## What It Does Not Do

This package does not:

- Render the document head. It returns data; `@trebired/bundler` emits tags.
- Own favicons, `theme-color`, web app manifests, or `apple-touch-icon`. Those are browser chrome, not indexing metadata.
- Own `charset`, `viewport`, preload, or prefetch tags.
- Own CSP, CORS, or any security header. Use `@trebired/security`.
- Own a route table, page copy, or translations. The application supplies them.
- Read the filesystem, fetch a network resource, or write a file.
- Emit `hreflang` alternates when every locale shares one URL.
- Ping search engines, submit sitemaps, or talk to any search console API.
- Measure, score, or audit a page.
