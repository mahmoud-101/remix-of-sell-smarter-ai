import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export default function HeroMockup() {
  const { isRTL } = useLanguage();

  return (
    <div className="relative mt-16 mb-8">
      {/* Main mockup container */}
      <div className="relative mx-auto max-w-4xl">
        {/* Browser window mockup */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
          {/* Browser header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background/50 rounded-lg px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                sellgenius.app
              </div>
            </div>
          </div>

          {/* App interface mockup */}
          <div className="p-6 bg-gradient-to-br from-background to-secondary/30">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input side */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">1</span>
                  </div>
                  {isRTL ? "أدخل معلومات المنتج" : "Enter Product Info"}
                </div>
                <div className="space-y-3">
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      {isRTL ? "اسم المنتج" : "Product Name"}
                    </div>
                    <div className="text-sm">
                      {isRTL ? "سماعات لاسلكية بلوتوث" : "Wireless Bluetooth Headphones"}
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      {isRTL ? "المميزات" : "Features"}
                    </div>
                    <div className="text-sm">
                      {isRTL 
                        ? "صوت نقي، بطارية 24 ساعة، مقاومة للماء" 
                        : "Crystal clear sound, 24hr battery, water resistant"}
                    </div>
                  </div>
                </div>
                <button className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 animate-glow">
                  <Sparkles className="w-4 h-4" />
                  {isRTL ? "توليد المحتوى" : "Generate Content"}
                </button>
              </div>

              {/* Output side */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  {isRTL ? "المحتوى الجاهز" : "Ready Content"}
                </div>
                <div className="bg-card rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full font-medium">
                    {isRTL ? "تم بنجاح" : "Generated"}
                  </div>
                  <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {isRTL ? "عنوان جذاب" : "Catchy Title"}
                      </div>
                      <div className="text-sm font-semibold gradient-text">
                        {isRTL 
                          ? "🎧 استمتع بصوت لا مثيل له مع سماعاتنا اللاسلكية!" 
                          : "🎧 Experience Unmatched Sound with Our Wireless Headphones!"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {isRTL ? "الوصف" : "Description"}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {isRTL 
                          ? "اكتشف تجربة صوتية استثنائية مع سماعاتنا اللاسلكية المتطورة. صوت نقي كالكريستال، بطارية تدوم 24 ساعة، ومقاومة للماء لمرافقتك في كل مكان..."
                          : "Discover an exceptional audio experience with our advanced wireless headphones. Crystal clear sound, 24-hour battery life, and water resistance to accompany you everywhere..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Stats floating cards */}
        <div className="absolute -right-4 top-1/4 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
          <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
            <div className="text-2xl font-bold gradient-text">40%</div>
            <div className="text-xs text-muted-foreground">
              {isRTL ? "زيادة المبيعات" : "Sales Boost"}
            </div>
          </div>
        </div>
        
        <div className="absolute -left-4 bottom-1/4 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
            <div className="text-2xl font-bold gradient-accent-text">10x</div>
            <div className="text-xs text-muted-foreground">
              {isRTL ? "أسرع في الكتابة" : "Faster Writing"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
