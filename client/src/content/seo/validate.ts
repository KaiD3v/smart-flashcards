import type { SeoPageContent } from "./types";
import { countPageWords } from "./utils";

const MIN_WORDS = 1000;
const MAX_WORDS = 2500;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;
const MIN_RELATED = 5;

export function validateSeoPage(
  page: SeoPageContent,
  allSlugs: Set<string>
): string[] {
  const errors: string[] = [];

  if (page.seoTitle.length > MAX_TITLE) {
    errors.push(`${page.slug}: seoTitle exceeds ${MAX_TITLE} chars`);
  }
  if (page.metaDescription.length > MAX_DESCRIPTION) {
    errors.push(`${page.slug}: metaDescription exceeds ${MAX_DESCRIPTION} chars`);
  }

  const words = countPageWords(page);
  if (words < MIN_WORDS) {
    errors.push(`${page.slug}: word count ${words} below ${MIN_WORDS}`);
  }
  if (words > MAX_WORDS) {
    errors.push(`${page.slug}: word count ${words} above ${MAX_WORDS}`);
  }

  if (page.relatedSlugs.length < MIN_RELATED) {
    errors.push(`${page.slug}: fewer than ${MIN_RELATED} related slugs`);
  }

  for (const related of page.relatedSlugs) {
    if (!allSlugs.has(related)) {
      errors.push(`${page.slug}: unknown related slug "${related}"`);
    }
    if (related === page.slug) {
      errors.push(`${page.slug}: self-reference in relatedSlugs`);
    }
  }

  if (page.faqs.length < 4) {
    errors.push(`${page.slug}: fewer than 4 FAQs`);
  }

  return errors;
}

export function validateSeoRegistry(pages: SeoPageContent[]): void {
  const slugs = new Set(pages.map((p) => p.slug));
  const titles = new Set<string>();
  const keywords = new Set<string>();
  const allErrors: string[] = [];

  for (const page of pages) {
    allErrors.push(...validateSeoPage(page, slugs));
    if (titles.has(page.seoTitle)) {
      allErrors.push(`duplicate seoTitle: ${page.seoTitle}`);
    }
    titles.add(page.seoTitle);
    if (keywords.has(page.primaryKeyword)) {
      allErrors.push(`duplicate primaryKeyword: ${page.primaryKeyword}`);
    }
    keywords.add(page.primaryKeyword);
  }

  if (allErrors.length > 0) {
    throw new Error(`SEO registry validation failed:\n${allErrors.join("\n")}`);
  }
}
