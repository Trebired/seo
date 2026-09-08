import { toTrimmedString as toString } from "@trebired/utils";

import { normalizeConfig } from "./config.js";
import { robotsHeader } from "./robots.js";
import { absoluteUrl, normalizePath } from "./url.js";
import type { SeoConfig, SeoDescriptor, SeoRobots } from "./types.js";

type CanonicalRedirect = {
  location: string;
  status: 301;
};

function seoHeaders(descriptor: SeoDescriptor): Record<string, string> {
  return { Link: `<${descriptor.canonical}>; rel="canonical"`, ...robotsHeader(descriptor.robots) };
}

function noindexHeaders(robots: SeoRobots = {}): Record<string, string> {
  return robotsHeader({ follow: false, index: false, ...robots });
}

function canonicalRedirect(config: SeoConfig, requestUrl: string): CanonicalRedirect | null {
  const normalized = normalizeConfig(config);
  const origin = normalized.site.url;

  let parsed: URL;
  try {
    parsed = new URL(toString(requestUrl), origin);
  } catch {
    return null;
  }

  const expectedHost = new URL(origin).host;
  const canonicalPath = normalizePath(parsed.pathname);
  const hostMatches = parsed.host === expectedHost;
  const pathMatches = parsed.pathname === canonicalPath;

  if (hostMatches && pathMatches) return null;

  return {
    location: `${absoluteUrl(origin, canonicalPath)}${parsed.search}`,
    status: 301,
  };
}

export { canonicalRedirect, noindexHeaders, seoHeaders };
export type { CanonicalRedirect };
