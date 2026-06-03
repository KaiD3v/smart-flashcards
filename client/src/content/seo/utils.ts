import type { SeoPageContent, SeoSection } from "./types";

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function countPageWords(page: SeoPageContent): number {
  const parts = [
    page.intro,
    ...page.sections.flatMap((s) => s.paragraphs),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  return parts.reduce((sum, part) => sum + countWords(part), 0);
}

export function section(
  id: string,
  heading: string,
  level: 2 | 3,
  paragraphs: string[]
): SeoSection {
  return { id, heading, level, paragraphs };
}
