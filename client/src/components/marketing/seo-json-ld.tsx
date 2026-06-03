import { buildSeoJsonLd } from "@/lib/seo/json-ld";
import type { SeoPageContent } from "@/content/seo/types";

export function SeoJsonLd({ page }: { page: SeoPageContent }) {
  const schemas = buildSeoJsonLd(page);

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
