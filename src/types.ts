type SeoRobots = {
  follow?: boolean;
  index?: boolean;
  maxImagePreview?: "large" | "none" | "standard";
  maxSnippet?: number;
  noarchive?: boolean;
  notranslate?: boolean;
};

type SeoImage = {
  alt?: string;
  height?: number;
  type?: string;
  url: string;
  width?: number;
};

type SeoLocaleStrategy = "none" | "prefix" | "query";

type SeoSite = {
  defaultLocale: string;
  locales?: readonly string[];
  name: string;
  url: string;
};

type SeoTwitter = {
  card?: "app" | "player" | "summary" | "summary_large_image";
  creator?: string;
  site?: string;
};

type SeoDefaults = {
  description?: string;
  image?: SeoImage;
  robots?: SeoRobots;
  type?: string;
};

type SeoSitemapEntryConfig = {
  changeFrequency?: SeoChangeFrequency;
  priority?: number;
};

type SeoSitemapConfig = SeoSitemapEntryConfig& {
  exclude?: readonly string[];
};

type SeoRobotsTxtConfig = {
  allow?: readonly string[];
  disallow?: readonly string[];
  host?: boolean;
  sitemap?: boolean;
};

type SeoChangeFrequency =
|"always"
|"daily"
|"hourly"
|"monthly"
|"never"
|"weekly"
|"yearly";

type SeoConfig = {
  defaults?: SeoDefaults;
  forVersion: string;
  localeStrategy?: SeoLocaleStrategy;
  robotsTxt?: SeoRobotsTxtConfig;
  site: SeoSite;
  sitemap?: SeoSitemapConfig;
  titleTemplate?: string;
  twitter?: SeoTwitter;
};

type NormalizedSeoConfig = {
  defaults: Required<Pick<SeoDefaults, "robots"|"type">>&SeoDefaults;
  forVersion: string;
  localeStrategy: SeoLocaleStrategy;
  robotsTxt: SeoRobotsTxtConfig;
  site: Required<SeoSite>;
  sitemap: SeoSitemapConfig;
  titleTemplate: string;
  twitter: SeoTwitter;
};

type NormalizeSeoConfigOptions = {
  configPath?: string;
  requireForVersion?: boolean;
};

type SeoRouteInput = {
  description?: string;
  image?: SeoImage;
  locale?: string;
  path: string;
  robots?: SeoRobots;
  structuredData?: readonly SeoStructuredData[];
  title?: string;
  type?: string;
};

type SeoLink = {
  href: string;
  hreflang?: string;
  rel: string;
  type?: string;
};

type SeoMeta = {
  content: string;
  name?: string;
  property?: string;
};

type SeoStructuredData = Record<string, unknown>;

type SeoDescriptor = {
  canonical: string;
  description: string;
  lang: string;
  links: SeoLink[];
  metas: SeoMeta[];
  robots: SeoRobots;
  structuredData: SeoStructuredData[];
  title: string;
};

type SeoShellMeta = {
  description: string;
  lang: string;
  links: SeoLink[];
  metas: SeoMeta[];
  title: string;
};

type SeoSitemapEntry = SeoSitemapEntryConfig& {
  lastModified?: Date | string;
  path: string;
};

export type {
  NormalizedSeoConfig,
  NormalizeSeoConfigOptions,
  SeoChangeFrequency,
  SeoConfig,
  SeoDefaults,
  SeoDescriptor,
  SeoImage,
  SeoLink,
  SeoLocaleStrategy,
  SeoMeta,
  SeoRobots,
  SeoRobotsTxtConfig,
  SeoRouteInput,
  SeoShellMeta,
  SeoSite,
  SeoSitemapConfig,
  SeoSitemapEntry,
  SeoStructuredData,
  SeoTwitter,
};
