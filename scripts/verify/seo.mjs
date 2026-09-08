import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const distEntry = path.join(rootDir, "dist", "index.js");

const seo = await import(distEntry);

const failures = [];

function check(name, condition, detail = "") {
  if (condition) return;
  failures.push(detail ? `${name}: ${detail}` : name);
}

const config = seo.defineConfig({
    defaults: { description: "Fallback description", image: { url: "/card.png" } },
    forVersion: "0.1.0",
    localeStrategy: "prefix",
    site: {
      defaultLocale: "en",
      locales: ["en", "cs"],
      name: "Example",
      url: "https://example.com/",
    },
    titleTemplate: "%s | Example",
    twitter: { site: "@example" },
});

const home = seo.buildRouteSeo(config, { path: "/", title: "Home" });

check("title template applied", home.title === "Home | Example", home.title);
check("canonical is absolute", home.canonical === "https://example.com/", home.canonical);
check("lang defaults to site locale", home.lang === "en", home.lang);
check("description falls back", home.description === "Fallback description", home.description);

function metaValue(descriptor, key) {
  const found = descriptor.metas.find((meta) => meta.name === key || meta.property === key);
  return found ? found.content : "";
}

check("og:title present", metaValue(home, "og:title") === "Home | Example");
check("og:url is canonical", metaValue(home, "og:url") === "https://example.com/");
check("og:site_name present", metaValue(home, "og:site_name") === "Example");
check("og:locale present", metaValue(home, "og:locale") === "en");
check("twitter:card defaults", metaValue(home, "twitter:card") === "summary_large_image");
check("robots defaults to index", metaValue(home, "robots") === "index,follow");
check(
  "og:image resolved absolute",
  metaValue(home, "og:image") === "https://example.com/card.png",
  metaValue(home, "og:image"),
);

const alternates = home.links.filter((link) => link.rel === "alternate");
check("hreflang alternates emitted", alternates.length === 3, String(alternates.length));
check(
  "x-default alternate present",
  alternates.some((link) => link.hreflang === "x-default"),
);
check(
  "cs alternate is prefixed",
  alternates.some((link) => link.hreflang === "cs" && link.href === "https://example.com/cs"),
);

const noindex = seo.buildRouteSeo(config, {
    path: "/private",
    robots: { follow: false, index: false },
    title: "Private",
});
check("robots noindex honoured", metaValue(noindex, "robots") === "noindex,nofollow");

const singleLocale = seo.defineConfig({
    forVersion: "0.1.0",
    site: { defaultLocale: "en", name: "Solo", url: "https://solo.test" },
});
const soloRoute = seo.buildRouteSeo(singleLocale, { path: "/x", title: "X" });
check(
  "no alternates without locale strategy",
  soloRoute.links.filter((link) => link.rel === "alternate").length === 0,
);
check("bare title without template", soloRoute.title === "X", soloRoute.title);

const shell = seo.toShellMeta(home);
check("shell meta carries title", shell.title === home.title);
check("shell meta carries lang", shell.lang === "en");
check("shell meta has no extra keys", Object.keys(shell).length === 5);

const script = seo.renderStructuredData([
    seo.webSiteSchema({ name: "Example", url: "https://example.com" }),
]);
check("json-ld renders a script tag", script.startsWith('<script type="application/ld+json">'));
check("json-ld carries context", script.includes('"@context":"https://schema.org"'));

const injected = seo.serializeStructuredData([{ name: "</script><img onerror=x>" }]);
check("json-ld escapes closing script", !injected.includes("</script>"), injected);

const sitemap = seo.buildSitemap(config, [
    { changeFrequency: "weekly", path: "/", priority: 1 },
    { lastModified: "2026-01-02T03:04:05.000Z", path: "/about" },
    { path: "/skip" },
]);
check("sitemap declares urlset", sitemap.includes("<urlset"));
check("sitemap contains home loc", sitemap.includes("<loc>https://example.com/</loc>"));
check("sitemap emits lastmod", sitemap.includes("<lastmod>2026-01-02</lastmod>"));
check("sitemap emits changefreq", sitemap.includes("<changefreq>weekly</changefreq>"));
check("sitemap emits hreflang alternates", sitemap.includes('hreflang="cs"'));

const excluded = seo.buildSitemap(
  { ...config, sitemap: { exclude: ["/skip"] } },
  [{ path: "/" }, { path: "/skip" }],
);
check("sitemap exclude honoured", !excluded.includes("/skip"));

const robotsTxt = seo.buildRobotsTxt(seo.normalizeConfig(config));
check("robots.txt has user-agent", robotsTxt.startsWith("User-agent: *"));
check("robots.txt links sitemap", robotsTxt.includes("Sitemap: https://example.com/sitemap.xml"));

const headers = seo.seoHeaders(home);
check("X-Robots-Tag header built", headers["X-Robots-Tag"] === "index,follow");
check("canonical Link header built", headers.Link.includes("rel=\"canonical\""));

const redirect = seo.canonicalRedirect(config, "https://example.com/about/");
check("trailing slash redirects", redirect?.location === "https://example.com/about", String(redirect?.location));
check("canonical url does not redirect", seo.canonicalRedirect(config, "https://example.com/about") === null);

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`SEO verification failed: ${failures.length} check(s).`);
  process.exit(1);
}

console.log("SEO verification succeeded.");
