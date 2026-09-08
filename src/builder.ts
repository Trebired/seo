import { normalizeConfig } from "./config.js";
import { buildRouteSeo } from "./route.js";
import { buildRobotsTxt } from "./robots.js";
import { buildSitemap } from "./sitemap.js";
import { mergeShellMeta, renderStructuredData, toShellMeta } from "./shell.js";
import type {
  NormalizedSeoConfig,
  SeoConfig,
  SeoDescriptor,
  SeoRouteInput,
  SeoSitemapEntry,
  SeoStructuredData,
} from "./types.js";

type SeoChrome<Link, Meta> = {
  links?: readonly Link[];
  metas?: readonly Meta[];
};

type SeoBuilderOptions<Link, Meta> = {
  chrome?: SeoChrome<Link, Meta>;
  configPath?: string;
  requireForVersion?: boolean;
};

type SeoBuilder<Link, Meta> = {
  config: NormalizedSeoConfig;
  descriptor: (input: SeoRouteInput) => SeoDescriptor;
  robotsTxt: () => string;
  shellMeta: (input: SeoRouteInput) => ReturnType<typeof mergeShellMeta<Link, Meta>>;
  sitemap: (entries: readonly SeoSitemapEntry[]) => string;
  structuredData: (entries: readonly SeoStructuredData[]) => string;
};

function createSeoBuilder<Link=never, Meta=never>(
  config: SeoConfig,
  options: SeoBuilderOptions<Link, Meta> = {},
): SeoBuilder<Link, Meta> {
  const normalized = normalizeConfig(config, {
      configPath: options.configPath,
      requireForVersion: options.requireForVersion,
  });

  function descriptor(input: SeoRouteInput): SeoDescriptor {
    return buildRouteSeo(config, input);
  }

  return {
    config: normalized,
    descriptor,
    robotsTxt: () => buildRobotsTxt(normalized),
    shellMeta: (input) => mergeShellMeta<Link, Meta>(toShellMeta(descriptor(input)), options.chrome),
    sitemap: (entries) => buildSitemap(config, entries),
    structuredData: (entries) => renderStructuredData(entries),
  };
}

export { createSeoBuilder };
export type { SeoBuilder, SeoBuilderOptions, SeoChrome };
