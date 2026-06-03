import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";
import {
  getAllSeoPages,
  getPageBySlug,
  getSeoSlugs,
} from "@/content/seo/registry";
import { buildSeoMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) return {};
  return buildSeoMetadata(page);
}

export default async function SeoSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) notFound();
  return <SeoLandingPage page={page} />;
}

// Ensure registry is validated at build time
void getAllSeoPages();
