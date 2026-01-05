import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle } from "lucide-react";

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
      ar: "سيل جينيوس هي منصة ذكاء اصطناعي متخصصة في التجارة الإلكترونية. تساعدك على إنشاء نصوص منتجات، إعلانات، حملات تسويقية، وتحليل المنافسين بسرعة فائقة. نستخدم أحدث تقنيات الذكاء الاصطناعي لفهم السوق العربي والخليجي بشكل عميق.",
      en: "SellGenius is an AI platform specialized in e-commerce. It helps you create product copy, ads, marketing campaigns, and analyze competitors at lightning speed. We use the latest AI technologies to deeply understand the Arabic and Gulf market.",
    },
  },
  {
    question: {
      ar: "هل يمكنني تجربة المنصة مجاناً؟",
      en: "Can I try the platform for free?",
    },
    answer: {
      ar: "نعم! نقدم خطة مجانية تتضمن 5 توليدات شهرياً. كما نقدم تجربة مجانية لمدة 14 يوماً للخطط المدفوعة بدون الحاجة لبطاقة ائتمان. يمكنك البدء فوراً والترقية في أي وقت.",
      en: "Yes! We offer a free plan with 5 generations per month. We also offer a 14-day free trial for paid plans without requiring a credit card. You can start immediately and upgrade anytime.",
    },
  },
  {
    question: {
      ar: "هل يدعم سيل جينيوس اللغة العربية؟",
      en: "Does SellGenius support Arabic?",
    },
    answer: {
      ar: "نعم! سيل جينيوس يدعم اللغة العربية بشكل كامل ومتقدم. الذكاء الاصطناعي مدرب خصيصاً لفهم السوق العربي والخليجي وإنتاج محتوى عربي احترافي يخاطب جمهورك مباشرة بلهجتهم وثقافتهم.",
      en: "Yes! SellGenius fully supports Arabic at an advanced level. The AI is specially trained to understand the Arabic and Gulf market and produce professional Arabic content that speaks directly to your audience in their dialect and culture.",
    },
  },
  {
    question: {
      ar: "كيف يتم الدفع؟",
      en: "How does payment work?",
    },
    answer: {
      ar: "نقبل جميع البطاقات الائتمانية والخصم المباشر (فيزا، ماستركارد، مدى). الدفع شهري ويمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية. نقدم أيضاً خصومات على الاشتراكات السنوية.",
      en: "We accept all credit and debit cards (Visa, Mastercard, Mada). Payment is monthly and you can cancel your subscription at any time without any additional fees. We also offer discounts on annual subscriptions.",
    },
  },
  {
    question: {
      ar: "هل يمكنني ترقية أو تخفيض خطتي؟",
      en: "Can I upgrade or downgrade my plan?",
    },
    answer: {
      ar: "بالتأكيد! يمكنك تغيير خطتك في أي وقت من إعدادات الحساب. التغييرات تسري فوراً ويتم احتساب الفرق بشكل تناسبي. لن تخسر أي رصيد متبقي عند الترقية.",
      en: "Absolutely! You can change your plan at any time from account settings. Changes take effect immediately and the difference is calculated proportionally. You won't lose any remaining balance when upgrading.",
    },
  },
  {
    question: {
      ar: "ما هي جودة المحتوى المُولّد؟",
      en: "What is the quality of generated content?",
    },
    answer: {
      ar: "نستخدم أحدث نماذج الذكاء الاصطناعي (GPT-5 و Gemini Pro) المدربة خصيصاً على المحتوى التسويقي. المحتوى جاهز للنشر مباشرة، لكن يمكنك تعديله حسب رغبتك. عملاؤنا يحققون زيادة 40% في معدلات التحويل.",
      en: "We use the latest AI models (GPT-5 and Gemini Pro) specially trained on marketing content. Content is ready to publish directly, but you can edit it as you wish. Our customers achieve 40% increase in conversion rates.",
    },
  },
  {
    question: {
      ar: "هل بياناتي آمنة؟",
      en: "Is my data secure?",
    },
    answer: {
      ar: "نعم، نولي أمان بياناتك أهمية قصوى. نستخدم تشفير SSL 256-bit ونلتزم بمعايير GDPR. لا نشارك بياناتك مع أي طرف ثالث ولا نستخدم محتواك لتدريب نماذجنا.",
      en: "Yes, we take your data security very seriously. We use 256-bit SSL encryption and comply with GDPR standards. We don't share your data with any third party and don't use your content to train our models.",
    },
  },
  {
    question: {
      ar: "كم من الوقت يستغرق توليد المحتوى؟",
      en: "How long does it take to generate content?",
    },
    answer: {
      ar: "يتم توليد المحتوى في ثوانٍ معدودة! عادةً من 5-15 ثانية حسب نوع المحتوى وطوله. هذا يعني أنك تستطيع إنتاج محتوى لـ 50 منتج في أقل من ساعة واحدة.",
      en: "Content is generated in just seconds! Usually 5-15 seconds depending on content type and length. This means you can produce content for 50 products in less than an hour.",
    },
  },
  {
    question: {
      ar: "هل يمكنني استخدام المحتوى تجارياً؟",
      en: "Can I use the content commercially?",
    },
    answer: {
      ar: "نعم، بالتأكيد! جميع المحتوى المُولّد ملكك بالكامل ويمكنك استخدامه في أي غرض تجاري بدون قيود. لا نحتفظ بأي حقوق على المحتوى الذي تنشئه.",
      en: "Yes, absolutely! All generated content is fully yours and you can use it for any commercial purpose without restrictions. We don't retain any rights to the content you create.",
    },
  },
  {
    question: {
      ar: "هل تقدمون دعماً فنياً؟",
      en: "Do you offer technical support?",
    },
    answer: {
      ar: "نعم! نقدم دعماً عبر البريد الإلكتروني لجميع الخطط، ودعماً أولوية 24/7 للخطط المدفوعة. كما نوفر قاعدة معرفية شاملة ودروس فيديو تعليمية.",
      en: "Yes! We offer email support for all plans, and 24/7 priority support for paid plans. We also provide a comprehensive knowledge base and tutorial videos.",
    },
  },
];
export default function FAQSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            {isRTL ? "الدعم والمساعدة" : "Support & Help"}
          </div>
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
              ? "إجابات على أكثر الأسئلة شيوعاً. لم تجد إجابتك؟ تواصل معنا!"
              : "Answers to the most common questions. Can't find your answer? Contact us!"}
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 data-[state=open]:border-primary/50 data-[state=open]:bg-primary/5 transition-all duration-300 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AccordionTrigger className="text-start hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                <span className="font-semibold text-base">{faq.question[language]}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer[language]}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-8 text-center p-6 rounded-2xl bg-secondary/50 border border-border">
          <p className="text-muted-foreground mb-3">
            {isRTL ? "لم تجد إجابة سؤالك؟" : "Didn't find your answer?"}
          </p>
          <a 
            href="mailto:support@sellgenius.app" 
            className="text-primary hover:underline font-medium"
          >
            {isRTL ? "تواصل مع فريق الدعم" : "Contact our support team"} →
          </a>
        </div>
      </div>
    </section>
  );
}
