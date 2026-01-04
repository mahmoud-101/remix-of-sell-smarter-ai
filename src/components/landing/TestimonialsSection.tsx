import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Testimonial {
  id: number;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  content: { ar: string; en: string };
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: { ar: "أحمد محمد", en: "Ahmed Mohamed" },
    role: { ar: "صاحب متجر إلكتروني", en: "E-commerce Store Owner" },
    content: {
      ar: "سيل جينيوس غير طريقة كتابة المحتوى لمنتجاتي تماماً. زادت مبيعاتي بنسبة 35% في الشهر الأول!",
      en: "SellGenius completely changed how I write content for my products. My sales increased by 35% in the first month!",
    },
    rating: 5,
    avatar: "AM",
  },
  {
    id: 2,
    name: { ar: "سارة العلي", en: "Sara Al-Ali" },
    role: { ar: "مديرة تسويق", en: "Marketing Manager" },
    content: {
      ar: "أفضل استثمار لفريق التسويق. نوفر ساعات يومياً في كتابة الإعلانات والمحتوى. النتائج مذهلة!",
      en: "Best investment for our marketing team. We save hours daily on ad copy and content. The results are amazing!",
    },
    rating: 5,
    avatar: "SA",
  },
  {
    id: 3,
    name: { ar: "خالد الراشد", en: "Khaled Al-Rashid" },
    role: { ar: "رائد أعمال", en: "Entrepreneur" },
    content: {
      ar: "أداة لا غنى عنها لأي بائع إلكتروني. الذكاء الاصطناعي يفهم السوق العربي بشكل ممتاز.",
      en: "An indispensable tool for any e-commerce seller. The AI understands the Arabic market excellently.",
    },
    rating: 5,
    avatar: "KR",
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
              ? "انضم لآلاف البائعين الذين يستخدمون سيل جينيوس لتنمية أعمالهم"
              : "Join thousands of sellers who use SellGenius to grow their businesses"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name[language]}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role[language]}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                "{testimonial.content[language]}"
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10K+", label: { ar: "مستخدم نشط", en: "Active Users" } },
            { value: "500K+", label: { ar: "محتوى مولد", en: "Content Generated" } },
            { value: "40%", label: { ar: "زيادة التحويلات", en: "Conversion Boost" } },
            { value: "4.9/5", label: { ar: "تقييم المستخدمين", en: "User Rating" } },
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
