# Changelog

All notable changes to `@trebired/seo` will be documented here.

This project follows semantic versioning once published.

## 0.1.0

- Added `buildRouteSeo()`, which turns one config plus per-route copy into a `SeoDescriptor` carrying title, description, canonical, robots, Open Graph, Twitter card, and `hreflang` data.
- Added `toShellMeta()`, returning the exact `{ title, description, lang, links, metas }` shape `@trebired/bundler`'s static shell consumes.
- Added `defineConfig()` and `normalizeConfig()` for `.trebired/seo/config.ts`, requiring `site.name`, `site.url`, and `site.defaultLocale` and throwing at build time when one is missing.
- Added a `localeStrategy` option (`none`, `prefix`, `query`). `none` emits no `hreflang` alternates, because alternates pointing at a single shared URL carry no information.
- Added `buildSitemap()` with `xhtml:link` alternates, `lastmod`, `changefreq`, `priority`, and per-path exclusion.
- Added `buildRobotsTxt()`, `robotsContent()`, `robotsDirectives()`, and `robotsHeader()`.
- Added JSON-LD builders `webSiteSchema()`, `personSchema()`, `organizationSchema()`, and `breadcrumbSchema()`, plus `renderStructuredData()` and `serializeStructuredData()` which escape `</script` and `<!--`.
- Added server helpers `seoHeaders()`, `noindexHeaders()`, and `canonicalRedirect()`.
- Added `verify:seo`, an executable verification of descriptor output, locale strategies, sitemap and robots generation, JSON-LD escaping, and canonical redirects, wired into `prepublishOnly`.
