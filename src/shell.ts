import type { SeoDescriptor, SeoShellMeta, SeoStructuredData } from "./types.js";

const SCRIPT_CLOSE = /<\/(script)/giu;

function escapeJsonLd(value: string): string {
  return value.replace(SCRIPT_CLOSE, "<\\/$1").replace(/<!--/gu, "\\u003C!--");
}

function serializeStructuredData(entries: readonly SeoStructuredData[]): string {
  if (!entries.length) return "";
  const payload = entries.length === 1 ? entries[0] : entries;
  return escapeJsonLd(JSON.stringify(payload));
}

function renderStructuredData(entries: readonly SeoStructuredData[]): string {
  const json = serializeStructuredData(entries);
  if (!json) return "";
  return `<script type="application/ld+json">${json}</script>`;
}

function toShellMeta(descriptor: SeoDescriptor): SeoShellMeta {
  return {
    description: descriptor.description,
    lang: descriptor.lang,
    links: descriptor.links,
    metas: descriptor.metas,
    title: descriptor.title,
  };
}

export { escapeJsonLd, renderStructuredData, serializeStructuredData, toShellMeta };
