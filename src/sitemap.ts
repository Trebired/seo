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

function localized(config: NormalizedSeoConfig, path: string, locale: string): string {
  return localizedUrl(config.site.url, path, locale, config.site.defaultLocale, config.localeStrategy);
}

function alternateNode(hreflang: string, href: string): string {
  return `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`;
}

function alternateNodes(config: NormalizedSeoConfig, path: string): string[] {
  if (!isLocalized(config)) return [];
  const nodes = config.site.locales.map((locale) => alternateNode(locale, localized(config, path, locale)));
  nodes.push(alternateNode("x-default", localized(config, path, config.site.defaultLocale)));
  return nodes;
}

function isLocalized(config: NormalizedSeoConfig): boolean {
  return config.localeStrategy !== "none" && config.site.locales.length > 1;
}

function entryNode(config: NormalizedSeoConfig, entry: SeoSitemapEntry, locale: string): string {
  const loc = localized(config, entry.path, locale);
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
  const locales = isLocalized(normalized) ? normalized.site.locales : [normalized.site.defaultLocale];
  const nodes = entries
  .filter((entry) => !isExcluded(normalized, entry.path))
  .flatMap((entry) => locales.map((locale) => entryNode(normalized, entry, locale)));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...nodes,
    "</urlset>",
    "",
  ].join("\n");
}

export { buildSitemap, escapeXml };
