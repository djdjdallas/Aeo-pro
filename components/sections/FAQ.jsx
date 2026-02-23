"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How is this different from SEO?",
    answer:
      "SEO gets you ranked on Google. AEO gets you recommended by AI. They're complementary but most agencies only do one. We specialize in the one that's growing fastest.",
  },
  {
    question: "How do I know it's working?",
    answer:
      "Every week we ask ChatGPT and Perplexity about your business category in your city and screenshot the results. You'll see your name appear in real time.",
  },
  {
    question: "What if I already have an SEO agency?",
    answer:
      "Perfect. We work alongside them. They handle Google, we handle AI. Different channels, same goal.",
  },
  {
    question: "How long until I see results?",
    answer:
      "Most clients see their first AI mentions within 30–60 days. Broad category mentions typically come in by month 3.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#111111]/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          Frequently asked questions
        </h2>

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
