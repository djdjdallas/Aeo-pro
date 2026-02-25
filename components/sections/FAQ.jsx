"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { homepageFaqs as faqs } from "@/lib/homepage-data";

export default function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          Frequently asked questions
        </h2>

        {/*
          Hidden crawlable FAQ content for AI and search engine crawlers.
          Visually hidden but present in the DOM for semantic extraction.
          This ensures AI models can read the full Q&A even if the accordion
          is collapsed on page load.
        */}
        <div className="sr-only" aria-hidden="false" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, idx) => (
            <div key={idx} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name">{faq.question}</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive accordion for visitors */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-white text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
