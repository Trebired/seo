import { toTrimmedString as toString } from "@trebired/utils";

import type { SeoLocaleStrategy } from "./types.js";

function normalizeOrigin(input: string): string {
  const value = toString(input).replace(/\/+$/u, "");
  return value;
}

function normalizePath(input: string): string {
  const value = toString(input) || "/";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  if (withSlash.length === 1) return "/";
  return withSlash.replace(/\/+$/u, "") || "/";
}

function localizedPath(
  path: string,
  locale: string,
  defaultLocale: string,
  strategy: SeoLocaleStrategy,
): string {
  const base = normalizePath(path);
  if (strategy === "none") return base;
  /* prefix-all gives the default locale a prefix too, so its canonical URL is
     the prefixed one rather than the bare path. */
  if (locale === defaultLocale && strategy !== "prefix-all") return base;
  if (strategy === "query") return `${base}?lang=${encodeURIComponent(locale)}`;
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

function absoluteUrl(origin: string, path: string): string {
  const base = normalizeOrigin(origin);
  const target = toString(path);
  if (/^https?:\/\//iu.test(target)) return target;
  if (target.startsWith("?")) return `${base}/${target}`;
  return `${base}${normalizePath(target)}`;
}

function localizedUrl(
  origin: string,
  path: string,
  locale: string,
  defaultLocale: string,
  strategy: SeoLocaleStrategy,
): string {
  return absoluteUrl(origin, localizedPath(path, locale, defaultLocale, strategy));
}

export { absoluteUrl, localizedPath, localizedUrl, normalizeOrigin, normalizePath };
