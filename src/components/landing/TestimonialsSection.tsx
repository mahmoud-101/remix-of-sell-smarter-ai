import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Testimonial {
  id: number;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  company: { ar: string; en: string };
  content: { ar: string; en: string };
  rating: number;
  avatar: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: { ar: "أحمد محمد العتيبي", en: "Ahmed Mohamed Al-Otaibi" },
    role: { ar: "صاحب متجر إلكتروني", en: "E-commerce Store Owner" },
    company: { ar: "متجر أناقة", en: "Anaqah Store" },
    content: {
      ar: "سيل جينيوس غير طريقة كتابة المحتوى لمنتجاتي تماماً. كنت أقضي ساعات في كتابة وصف منتج واحد، الآن أنتهي من 50 منتج في ساعة واحدة! زادت مبيعاتي بنسبة 35% في الشهر الأول بفضل جودة المحتوى.",
      en: "SellGenius completely changed how I write content for my products. I used to spend hours on one product description, now I finish 50 products in an hour! My sales increased by 35% in the first month thanks to the content quality.",
    },
    rating: 5,
    avatar: "أع",
  },
  {
    id: 2,
    name: { ar: "سارة العلي المنصور", en: "Sara Al-Ali Al-Mansour" },
    role: { ar: "مديرة تسويق", en: "Marketing Manager" },
    company: { ar: "وكالة نجاح للتسويق", en: "Najah Marketing Agency" },
    content: {
      ar: "أفضل استثمار لفريق التسويق على الإطلاق. نوفر أكثر من 15 ساعة أسبوعياً في كتابة الإعلانات والمحتوى. النتائج مذهلة وعملاؤنا سعداء جداً بجودة المحتوى المنتج.",
      en: "Best investment for our marketing team ever. We save over 15 hours weekly on ad copy and content. The results are amazing and our clients are very happy with the quality of content produced.",
    },
    rating: 5,
    avatar: "سم",
  },
  {
    id: 3,
    name: { ar: "خالد الراشد العنزي", en: "Khaled Al-Rashid Al-Anzi" },
    role: { ar: "رائد أعمال ومؤسس", en: "Entrepreneur & Founder" },
    company: { ar: "تك زون للإلكترونيات", en: "TechZone Electronics" },
    content: {
      ar: "أداة لا غنى عنها لأي بائع إلكتروني جاد. الذكاء الاصطناعي يفهم السوق العربي بشكل ممتاز ويكتب بلغة تخاطب العميل مباشرة. أنصح بها بشدة لكل من يريد التوسع.",
      en: "An indispensable tool for any serious e-commerce seller. The AI understands the Arabic market excellently and writes in a language that speaks directly to the customer. I highly recommend it to anyone who wants to scale.",
    },
    rating: 5,
    avatar: "خر",
  },
  {
    id: 4,
    name: { ar: "نورة الخالد السبيعي", en: "Noura Al-Khaled Al-Subaie" },
    role: { ar: "صاحبة براند أزياء", en: "Fashion Brand Owner" },
    company: { ar: "نورة كوتور", en: "Noura Couture" },
    content: {
      ar: "كبراند أزياء ناشئ، كنت أحتاج محتوى راقي يعكس هوية علامتي. سيل جينيوس فاجأني بجودة المحتوى الفاخر الذي ينتجه. عملائي يشعرون بالفخامة من أول كلمة يقرأونها.",
      en: "As an emerging fashion brand, I needed premium content that reflects my brand identity. SellGenius surprised me with the luxurious content quality it produces. My customers feel the luxury from the first word they read.",
    },
    rating: 5,
    avatar: "نخ",
  },
  {
    id: 5,
    name: { ar: "محمد الشمري", en: "Mohammed Al-Shammari" },
    role: { ar: "مدير تجارة إلكترونية", en: "E-commerce Director" },
    company: { ar: "سوق البيت", en: "Home Market" },
    content: {
      ar: "لدينا أكثر من 5000 منتج وكان تحديث المحتوى كابوساً. مع سيل جينيوس، أعدنا كتابة كل المنتجات في أسبوعين فقط! النتيجة: زيادة 45% في وقت البقاء على الصفحة.",
      en: "We have over 5000 products and updating content was a nightmare. With SellGenius, we rewrote all products in just two weeks! Result: 45% increase in time on page.",
    },
    rating: 5,
    avatar: "مش",
  },
  {
    id: 6,
    name: { ar: "فاطمة الحربي", en: "Fatima Al-Harbi" },
    role: { ar: "مسوقة مستقلة", en: "Freelance Marketer" },
    company: { ar: "عمل حر", en: "Freelancer" },
    content: {
      ar: "كمسوقة مستقلة، سيل جينيوس ضاعف دخلي حرفياً! الآن أستطيع خدمة ضعف عدد العملاء بنفس الوقت. أداة لا أستغني عنها أبداً في عملي اليومي.",
      en: "As a freelance marketer, SellGenius literally doubled my income! Now I can serve twice as many clients in the same time. A tool I never work without daily.",
    },
    rating: 5,
    avatar: "فح",
  },
];

export default function TestimonialsSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                ماذا يقول
                <span className="gradient-text"> عملاؤنا</span>
              </>
            ) : (
              <>
                What Our
                <span className="gradient-text"> Customers Say</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "قصص نجاح حقيقية من بائعين ومسوقين يستخدمون سيل جينيوس يومياً"
              : "Real success stories from sellers and marketers who use SellGenius daily"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name[language]}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role[language]}</p>
                  <p className="text-xs text-primary">{testimonial.company[language]}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm">
                "{testimonial.content[language]}"
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10,000+", label: { ar: "مستخدم نشط", en: "Active Users" } },
            { value: "500,000+", label: { ar: "محتوى تم توليده", en: "Content Generated" } },
            { value: "40%", label: { ar: "متوسط زيادة التحويلات", en: "Avg. Conversion Boost" } },
            { value: "4.9/5", label: { ar: "تقييم رضا العملاء", en: "Customer Satisfaction" } },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
