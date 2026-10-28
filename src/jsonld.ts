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

type ArticleInput = {
  author: string | { name: string; url?: string };
  dateModified?: string;
  datePublished: string;
  description?: string;
  headline: string;
  image?: string;
  inLanguage?: string;
  publisher?: { logo?: string; name: string; url?: string };
  type?: "Article" | "BlogPosting" | "NewsArticle";
  url: string;
};

type FaqItem = {
  answer: string;
  question: string;
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

function articleSchema(input: ArticleInput): SeoStructuredData {
  const author = typeof input.author === "string" ? { name: input.author } : input.author;
  const data: SeoStructuredData = {
    author: { "@type": "Person", ...author },
    datePublished: input.datePublished,
    headline: toString(input.headline),
    mainEntityOfPage: input.url,
    url: input.url,
  };
  if (input.dateModified) data.dateModified = input.dateModified;
  if (input.description) data.description = input.description;
  if (input.image) data.image = input.image;
  if (input.inLanguage) data.inLanguage = input.inLanguage;
  if (input.publisher) {
    const { logo, ...publisher } = input.publisher;
    data.publisher = { "@type": "Organization", ...publisher, ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}) };
  }
  return withContext(input.type ||"Article", data);
}

function faqSchema(items: readonly FaqItem[]): SeoStructuredData {
  return withContext("FAQPage", {
      mainEntity: items.map((item) => ({
            "@type": "Question",
            acceptedAnswer: { "@type": "Answer", text: toString(item.answer) },
            name: toString(item.question),
      })),
  });
}

export { articleSchema, breadcrumbSchema, faqSchema, organizationSchema, personSchema, webSiteSchema, withContext };
export type { ArticleInput, BreadcrumbItem, FaqItem, OrganizationInput, PersonInput, WebSiteInput };
