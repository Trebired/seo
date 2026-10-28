import { toTrimmedString as toString } from "@trebired/utils";

import type { SeoAuditIssue, SeoAuditLimits, SeoAuditPage } from "./types.js";

const LIMITS: Required<SeoAuditLimits> = { descriptionMax: 160, descriptionMin: 110, titleMax: 60, titleMin: 25 };

function issue(page: SeoAuditPage, level: SeoAuditIssue["level"], rule: string, message: string): SeoAuditIssue {
  return { lang: page.lang, level, message, path: page.path, rule };
}

function lengthIssues(page: SeoAuditPage, limits: Required<SeoAuditLimits>): SeoAuditIssue[] {
  const title = toString(page.title);
  const description = toString(page.description);
  const found: SeoAuditIssue[] = [];
  if (!title) found.push(issue(page, "error", "title-missing", "has no title"));
  else if (title.length > limits.titleMax) {
    found.push(issue(page, "warning", "title-long", `title is ${title.length} characters, over ${limits.titleMax}`));
  } else if (title.length < limits.titleMin) {
    found.push(issue(page, "warning", "title-short", `title is ${title.length} characters, under ${limits.titleMin}`));
  }
  if (!description) found.push(issue(page, "error", "description-missing", "has no description"));
  else if (description.length > limits.descriptionMax) {
    found.push(issue(page, "warning", "description-long", `description is ${description.length} characters, over ${limits.descriptionMax}`));
  } else if (description.length < limits.descriptionMin) {
    found.push(issue(page, "warning", "description-short", `description is ${description.length} characters, under ${limits.descriptionMin}`));
  }
  return found;
}

function duplicateIssues(pages: readonly SeoAuditPage[], field: "description" | "title"): SeoAuditIssue[] {
  const seen = new Map<string, SeoAuditPage>();
  const found: SeoAuditIssue[] = [];
  for (const page of pages) {
    const value = toString(page[field]);
    if (!value) continue;
    const key = `${page.lang}\u0000${value}`;
    const first = seen.get(key);
    if (first) found.push(issue(page, "error", `${field}-duplicate`, `${field} repeats ${first.path}`));
    else seen.set(key, page);
  }
  return found;
}

function auditSeo(pages: readonly SeoAuditPage[], limits: SeoAuditLimits = {}): SeoAuditIssue[] {
  const bounds = { ...LIMITS, ...limits };
  const indexed = pages.filter((page) => page.robots?.index !== false);
  return [
    ...indexed.flatMap((page) => lengthIssues(page, bounds)),
    ...duplicateIssues(indexed, "title"),
    ...duplicateIssues(indexed, "description"),
  ];
}

export { auditSeo };
