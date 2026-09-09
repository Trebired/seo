import { resolveForVersion, toTrimmedString as toString } from "@trebired/utils";

import { PACKAGE_VERSION } from "./package-metadata.js";
import { normalizeOrigin } from "./url.js";
import type {
  NormalizedSeoConfig,
  NormalizeSeoConfigOptions,
  SeoConfig,
  SeoRobots,
} from "./types.js";

const DEFAULT_ROBOTS: SeoRobots = { follow: true, index: true };
const DEFAULT_TITLE_TEMPLATE = "%s";
const DEFAULT_TYPE = "website";

function defineConfig(config: SeoConfig): SeoConfig {
  return config;
}

function assertSite(config: SeoConfig): void {
  if (!toString(config.site?.name)) throw new Error("seo config requires site.name");
  if (!toString(config.site?.url)) throw new Error("seo config requires site.url");
  if (!toString(config.site?.defaultLocale)) {
    throw new Error("seo config requires site.defaultLocale");
  }
}

function normalizeLocales(config: SeoConfig): string[] {
  const declared = (config.site.locales || []).map((locale) => toString(locale)).filter(Boolean);
  const fallback = toString(config.site.defaultLocale);
  if (!declared.length) return [fallback];
  return declared.includes(fallback) ? declared : [fallback, ...declared];
}

function resolveConfigVersion(config: SeoConfig, options: NormalizeSeoConfigOptions): string {
  return resolveForVersion({
      config,
      configPath: options.configPath,
      forVersion: config.forVersion,
      label: "seo",
      packageVersion: PACKAGE_VERSION,
      requireForVersion: options.requireForVersion,
  });
}

function normalizeConfig(
  config: SeoConfig,
  options: NormalizeSeoConfigOptions = {},
): NormalizedSeoConfig {
  const forVersion = resolveConfigVersion(config, options);
  assertSite(config);

  return {
    defaults: {
      ...config.defaults,
      robots: { ...DEFAULT_ROBOTS, ...config.defaults?.robots },
      type: toString(config.defaults?.type) || DEFAULT_TYPE,
    },
    forVersion,
    localeStrategy: config.localeStrategy || "none",
    robotsTxt: { host: true, sitemap: true, ...config.robotsTxt },
    site: {
      defaultLocale: toString(config.site.defaultLocale),
      locales: normalizeLocales(config),
      name: toString(config.site.name),
      url: normalizeOrigin(config.site.url),
    },
    sitemap: { ...config.sitemap },
    titleTemplate: toString(config.titleTemplate) || DEFAULT_TITLE_TEMPLATE,
    twitter: { card: "summary_large_image", ...config.twitter },
  };
}

export { DEFAULT_ROBOTS, defineConfig, normalizeConfig };
