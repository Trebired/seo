import { toTrimmedString as toString } from "@trebired/utils";

import { absoluteUrl } from "./url.js";
import type { SeoStructuredData } from "./types.js";

type WebSiteInput = {
  description?: string;
  name: string;
  searchUrlTemplate?: string;
  url: string;
};

type PersonInput = {
  email?: string;
  jobTitle?: string;
  name: string;
  sameAs?: readonly string[];
  url: string;
};

type OrganizationInput = {
  email?: string;
  logo?: string;
  name: string;
  sameAs?: readonly string[];
  url: string;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

function withContext(type: string, data: SeoStructuredData): SeoStructuredData {
  return { "@context": "https://schema.org", "@type": type, ...data };
}

function webSiteSchema(input: WebSiteInput): SeoStructuredData {
  const data: SeoStructuredData = { name: input.name, url: input.url };
  if (input.description) data.description = input.description;
  if (input.searchUrlTemplate) {
    data.potentialAction = {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: { "@type": "EntryPoint", urlTemplate: input.searchUrlTemplate },
    };
  }
  return withContext("WebSite", data);
}

function personSchema(input: PersonInput): SeoStructuredData {
  const data: SeoStructuredData = { name: input.name, url: input.url };
  if (input.jobTitle) data.jobTitle = input.jobTitle;
  if (input.email) data.email = input.email;
  if (input.sameAs?.length) data.sameAs = [...input.sameAs];
  return withContext("Person", data);
}

function organizationSchema(input: OrganizationInput): SeoStructuredData {
  const data: SeoStructuredData = { name: input.name, url: input.url };
  if (input.logo) data.logo = input.logo;
  if (input.email) data.email = input.email;
  if (input.sameAs?.length) data.sameAs = [...input.sameAs];
  return withContext("Organization", data);
}

function breadcrumbSchema(origin: string, items: readonly BreadcrumbItem[]): SeoStructuredData {
  return withContext("BreadcrumbList", {
      itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            item: absoluteUrl(origin, item.path),
            name: toString(item.name),
            position: index + 1,
      })),
  });
}

export { breadcrumbSchema, organizationSchema, personSchema, webSiteSchema, withContext };
export type { BreadcrumbItem, OrganizationInput, PersonInput, WebSiteInput };
