import { toTrimmedString as toString } from "@trebired/utils";

import { absoluteUrl } from "./url.js";
import type { NormalizedSeoConfig, SeoRobots } from "./types.js";

function robotsDirectives(robots: SeoRobots): string[] {
  const directives: string[] = [];
  directives.push(robots.index === false ? "noindex" : "index");
  directives.push(robots.follow === false ? "nofollow" : "follow");
  if (robots.noarchive) directives.push("noarchive");
  if (robots.notranslate) directives.push("notranslate");
  if (typeof robots.maxSnippet === "number") {
    directives.push(`max-snippet:${Math.trunc(robots.maxSnippet)}`);
  }
  if (robots.maxImagePreview) directives.push(`max-image-preview:${robots.maxImagePreview}`);
  return directives;
}

function robotsContent(robots: SeoRobots): string {
  return robotsDirectives(robots).join(",");
}

function robotsHeader(robots: SeoRobots): Record<string, string> {
  return { "X-Robots-Tag": robotsContent(robots) };
}

function robotsTxtLines(config: NormalizedSeoConfig): string[] {
  const lines = ["User-agent: *"];
  for (const rule of config.robotsTxt.allow || []) {
    const value = toString(rule);
    if (value) lines.push(`Allow: ${value}`);
  }

  const disallow = config.robotsTxt.disallow || [];
  if (!disallow.length) lines.push("Disallow:");
  for (const rule of disallow) {
    const value = toString(rule);
    if (value) lines.push(`Disallow: ${value}`);
  }

  return lines;
}

function buildRobotsTxt(config: NormalizedSeoConfig): string {
  const lines = robotsTxtLines(config);
  if (config.robotsTxt.host !== false) lines.push("", `Host: ${config.site.url}`);
  if (config.robotsTxt.sitemap !== false) {
    lines.push(`Sitemap: ${absoluteUrl(config.site.url, "/sitemap.xml")}`);
  }
  return `${lines.join("\n")}\n`;
}

export { buildRobotsTxt, robotsContent, robotsDirectives, robotsHeader };
