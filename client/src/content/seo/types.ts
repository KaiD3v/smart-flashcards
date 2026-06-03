export type SeoCluster =
  | "anki-alternative"
  | "pdf-to-flashcards"
  | "medical-students"
  | "exam-preparation"
  | "spaced-repetition"
  | "ai-study-tools"
  | "active-recall"
  | "productivity";

export type SearchIntent = "informational" | "commercial" | "transactional";

export interface SeoSection {
  id: string;
  heading: string;
  level: 2 | 3;
  paragraphs: string[];
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoPageContent {
  slug: string;
  cluster: SeoCluster;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  relatedSlugs: string[];
  publishedAt?: string;
  updatedAt?: string;
}
