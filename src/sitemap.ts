import { toTrimmedString as toString } from "@trebired/utils";

import { normalizeConfig } from "./config.js";
import { localizedUrl, normalizePath } from "./url.js";
import type { NormalizedSeoConfig, SeoConfig, SeoSitemapEntry } from "./types.js";

const XML_ESCAPES: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

function escapeXml(value: string): string {
  return toString(value).replace(/[&<>"']/gu, (char) => XML_ESCAPES[char] || char);
}

function lastModifiedValue(input: SeoSitemapEntry["lastModified"]): string {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(String(input));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function isExcluded(config: NormalizedSeoConfig, path: string): boolean {
  return (config.sitemap.exclude || []).some((rule) => normalizePath(rule) === normalizePath(path));
}

function alternateNodes(config: NormalizedSeoConfig, path: string): string[] {
  if (config.localeStrategy === "none" || config.site.locales.length < 2) return [];
  return config.site.locales.map((locale) => {
      const href = localizedUrl(
        config.site.url,
        path,
        locale,
        config.site.defaultLocale,
        config.localeStrategy,
      );
      return `    <xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}"/>`;
  });
}

function entryNode(config: NormalizedSeoConfig, entry: SeoSitemapEntry): string {
  const loc = localizedUrl(
    config.site.url,
    entry.path,
    config.site.defaultLocale,
    config.site.defaultLocale,
    config.localeStrategy,
  );
  const lines = [`    <loc>${escapeXml(loc)}</loc>`, ...alternateNodes(config, entry.path)];

  const lastModified = lastModifiedValue(entry.lastModified);
  if (lastModified) lines.push(`    <lastmod>${lastModified}</lastmod>`);

  const changeFrequency = entry.changeFrequency || config.sitemap.changeFrequency;
  if (changeFrequency) lines.push(`    <changefreq>${changeFrequency}</changefreq>`);

  const priority = entry.priority ?? config.sitemap.priority;
  if (typeof priority === "number") lines.push(`    <priority>${priority.toFixed(1)}</priority>`);

  return ["  <url>", ...lines, "  </url>"].join("\n");
}

function buildSitemap(config: SeoConfig, entries: readonly SeoSitemapEntry[]): string {
  const normalized = normalizeConfig(config);
  const nodes = entries
  .filter((entry) => !isExcluded(normalized, entry.path))
  .map((entry) => entryNode(normalized, entry));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...nodes,
    "</urlset>",
    "",
  ].join("\n");
}

export { buildSitemap, escapeXml };
