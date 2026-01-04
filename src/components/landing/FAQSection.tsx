import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQ {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
}

const faqs: FAQ[] = [
  {
    question: {
      ar: "ما هو سيل جينيوس؟",
      en: "What is SellGenius?",
    },
    answer: {
      ar: "سيل جينيوس هي منصة ذكاء اصطناعي متخصصة في التجارة الإلكترونية. تساعدك على إنشاء نصوص منتجات، إعلانات، حملات تسويقية، وتحليل المنافسين بسرعة فائقة.",
      en: "SellGenius is an AI platform specialized in e-commerce. It helps you create product copy, ads, marketing campaigns, and analyze competitors at lightning speed.",
    },
  },
  {
    question: {
      ar: "هل يمكنني تجربة المنصة مجاناً؟",
      en: "Can I try the platform for free?",
    },
    answer: {
      ar: "نعم! نقدم خطة مجانية تتضمن 5 توليدات شهرياً. كما نقدم تجربة مجانية لمدة 14 يوماً للخطط المدفوعة بدون الحاجة لبطاقة ائتمان.",
      en: "Yes! We offer a free plan with 5 generations per month. We also offer a 14-day free trial for paid plans without requiring a credit card.",
    },
  },
  {
    question: {
      ar: "هل يدعم سيل جينيوس اللغة العربية؟",
      en: "Does SellGenius support Arabic?",
    },
    answer: {
      ar: "نعم! سيل جينيوس يدعم اللغة العربية بشكل كامل. الذكاء الاصطناعي مدرب خصيصاً لفهم السوق العربي وإنتاج محتوى عربي احترافي.",
      en: "Yes! SellGenius fully supports Arabic. The AI is specially trained to understand the Arabic market and produce professional Arabic content.",
    },
  },
  {
    question: {
      ar: "كيف يتم الدفع؟",
      en: "How does payment work?",
    },
    answer: {
      ar: "نقبل جميع البطاقات الائتمانية والخصم المباشر. الدفع شهري ويمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية.",
      en: "We accept all credit and debit cards. Payment is monthly and you can cancel your subscription at any time without any additional fees.",
    },
  },
  {
    question: {
      ar: "هل يمكنني ترقية أو تخفيض خطتي؟",
      en: "Can I upgrade or downgrade my plan?",
    },
    answer: {
      ar: "بالتأكيد! يمكنك تغيير خطتك في أي وقت من إعدادات الحساب. التغييرات تسري فوراً ويتم احتساب الفرق بشكل تناسبي.",
      en: "Absolutely! You can change your plan at any time from account settings. Changes take effect immediately and the difference is calculated proportionally.",
    },
  },
];

export default function FAQSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                الأسئلة
                <span className="gradient-text"> الشائعة</span>
              </>
            ) : (
              <>
                Frequently Asked
                <span className="gradient-text"> Questions</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground">
            {isRTL
              ? "إجابات على أكثر الأسئلة شيوعاً"
              : "Answers to the most common questions"}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="text-start hover:no-underline py-4">
                <span className="font-semibold">{faq.question[language]}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer[language]}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
