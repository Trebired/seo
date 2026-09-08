import { toTrimmedString as toString } from "@trebired/utils";

import { normalizeConfig } from "./config.js";
import { robotsContent } from "./robots.js";
import { absoluteUrl, localizedUrl, normalizePath } from "./url.js";
import type {
  NormalizedSeoConfig,
  SeoConfig,
  SeoDescriptor,
  SeoImage,
  SeoLink,
  SeoMeta,
  SeoRouteInput,
} from "./types.js";

function renderTitle(template: string, title: string, siteName: string): string {
  const value = toString(title);
  if (!value) return siteName;
  if (!template.includes("%s")) return value;
  return template.replace("%s", value);
}

function alternateLinks(config: NormalizedSeoConfig, input: SeoRouteInput): SeoLink[] {
  if (config.localeStrategy === "none" || config.site.locales.length < 2) return [];

  const links: SeoLink[] = config.site.locales.map((locale) => ({
        href: localizedUrl(
          config.site.url,
          input.path,
          locale,
          config.site.defaultLocale,
          config.localeStrategy,
        ),
        hreflang: locale,
        rel: "alternate",
  }));

  links.push({
      href: localizedUrl(
        config.site.url,
        input.path,
        config.site.defaultLocale,
        config.site.defaultLocale,
        config.localeStrategy,
      ),
      hreflang: "x-default",
      rel: "alternate",
  });

  return links;
}

function imageMetas(config: NormalizedSeoConfig, image: SeoImage | undefined): SeoMeta[] {
  if (!image || !toString(image.url)) return [];
  const url = absoluteUrl(config.site.url, image.url);
  const metas: SeoMeta[] = [
    { content: url, property: "og:image" },
    { content: url, name: "twitter:image" },
  ];
  if (image.alt) {
    metas.push({ content: image.alt, property: "og:image:alt" });
    metas.push({ content: image.alt, name: "twitter:image:alt" });
  }
  if (image.width) metas.push({ content: String(image.width), property: "og:image:width" });
  if (image.height) metas.push({ content: String(image.height), property: "og:image:height" });
  if (image.type) metas.push({ content: image.type, property: "og:image:type" });
  return metas;
}

function twitterMetas(config: NormalizedSeoConfig, title: string, description: string): SeoMeta[] {
  const metas: SeoMeta[] = [
    { content: config.twitter.card || "summary_large_image", name: "twitter:card" },
    { content: title, name: "twitter:title" },
  ];
  if (description) metas.push({ content: description, name: "twitter:description" });
  if (config.twitter.site) metas.push({ content: config.twitter.site, name: "twitter:site" });
  if (config.twitter.creator) {
    metas.push({ content: config.twitter.creator, name: "twitter:creator" });
  }
  return metas;
}

function openGraphMetas(
  config: NormalizedSeoConfig,
  input: { canonical: string; description: string; locale: string; title: string; type: string },
): SeoMeta[] {
  const metas: SeoMeta[] = [
    { content: input.type, property: "og:type" },
    { content: input.title, property: "og:title" },
    { content: input.canonical, property: "og:url" },
    { content: config.site.name, property: "og:site_name" },
    { content: input.locale, property: "og:locale" },
  ];
  if (input.description) metas.push({ content: input.description, property: "og:description" });
  for (const locale of config.site.locales) {
    if (locale !== input.locale) metas.push({ content: locale, property: "og:locale:alternate" });
  }
  return metas;
}

function buildRouteSeo(config: SeoConfig, input: SeoRouteInput): SeoDescriptor {
  const normalized = normalizeConfig(config);
  const locale = toString(input.locale) || normalized.site.defaultLocale;
  const title = renderTitle(normalized.titleTemplate, input.title || "", normalized.site.name);
  const description = toString(input.description) || toString(normalized.defaults.description);
  const robots = { ...normalized.defaults.robots, ...input.robots };
  const type = toString(input.type) || normalized.defaults.type;
  const image = input.image || normalized.defaults.image;

  const canonical = localizedUrl(
    normalized.site.url,
    input.path,
    locale,
    normalized.site.defaultLocale,
    normalized.localeStrategy,
  );

  return {
    canonical,
    description,
    lang: locale,
    links: [{ href: canonical, rel: "canonical" }, ...alternateLinks(normalized, input)],
    metas: [
      { content: robotsContent(robots), name: "robots" },
      ...openGraphMetas(normalized, { canonical, description, locale, title, type }),
      ...twitterMetas(normalized, title, description),
      ...imageMetas(normalized, image),
    ],
    robots,
    structuredData: [...(input.structuredData || [])],
    title,
  };
}

export { buildRouteSeo, normalizePath, renderTitle };
