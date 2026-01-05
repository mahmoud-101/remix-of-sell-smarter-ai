import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Zap, Users, MessageCircle, Globe, Star } from "lucide-react";

const videoStats = [
  { icon: Zap, value: "10x", label: { ar: "أسرع", en: "Faster" } },
  { icon: Users, value: "10K+", label: { ar: "مستخدم", en: "Users" } },
  { icon: Star, value: "4.9", label: { ar: "تقييم", en: "Rating" } },
];

export default function VideoSection() {
  const { isRTL, language } = useLanguage();

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? (
              <>
                شاهد كيف يعمل
                <span className="gradient-text"> سيل جينيوس</span>
              </>
            ) : (
              <>
                See How
                <span className="gradient-text"> SellGenius Works</span>
              </>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "في أقل من دقيقتين، تعرف على كيفية استخدام سيل جينيوس لمضاعفة مبيعاتك"
              : "In less than 2 minutes, learn how to use SellGenius to double your sales"}
          </p>
        </div>

        <div className="relative">
          {/* Video container with placeholder */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl relative group cursor-pointer">
            {/* Video placeholder - Replace with actual video embed */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                <svg className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">
                {isRTL ? "انقر لتشغيل الفيديو" : "Click to play video"}
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isRTL ? "2:15 دقيقة" : "2:15 min"}
            </div>
          </div>

          {/* Video stats */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8">
            {videoStats.map((stat, index) => (
              <div 
                key={index}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg"
              >
                <stat.icon className="w-5 h-5 text-primary" />
                <div className="text-center">
                  <div className="font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label[language]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
