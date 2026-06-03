import type { SeoFaq } from "@/content/seo/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SeoFaq({ faqs }: { faqs: SeoFaq[] }) {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="mt-8 w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-pretty leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
