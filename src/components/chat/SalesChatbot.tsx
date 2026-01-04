import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const salesTips = {
  ar: [
    "كيف أزيد مبيعاتي؟",
    "أفضل وقت للإعلانات",
    "تحسين صفحة المنتج",
    "استراتيجية التسعير",
  ],
  en: [
    "How to increase sales?",
    "Best time for ads",
    "Improve product page",
    "Pricing strategy",
  ],
};

const botResponses: Record<string, { ar: string; en: string }> = {
  default: {
    ar: "مرحباً! 👋 أنا مساعد المبيعات الذكي. كيف يمكنني مساعدتك في تعزيز مبيعاتك اليوم؟",
    en: "Hello! 👋 I'm your AI Sales Assistant. How can I help boost your sales today?",
  },
  sales: {
    ar: "إليك 5 استراتيجيات مجربة لزيادة المبيعات:\n\n🎯 **1. تحسين عناوين المنتجات** - استخدم كلمات قوية تثير العاطفة\n\n📸 **2. صور احترافية** - استثمر في تصوير عالي الجودة\n\n⭐ **3. المراجعات والتقييمات** - شجع العملاء على ترك تقييمات\n\n🏷️ **4. عروض محدودة الوقت** - خلق شعور بالإلحاح\n\n📱 **5. إعادة الاستهداف** - استهدف زوار موقعك السابقين\n\nهل تريد تفاصيل أكثر عن أي استراتيجية؟",
    en: "Here are 5 proven strategies to increase sales:\n\n🎯 **1. Optimize product titles** - Use power words that evoke emotion\n\n📸 **2. Professional photos** - Invest in high-quality photography\n\n⭐ **3. Reviews & ratings** - Encourage customers to leave reviews\n\n🏷️ **4. Limited-time offers** - Create urgency\n\n📱 **5. Retargeting** - Target previous site visitors\n\nWant more details on any strategy?",
  },
  timing: {
    ar: "أفضل أوقات نشر الإعلانات حسب المنصة:\n\n📘 **فيسبوك**: الثلاثاء-الخميس، 1-4 مساءً\n\n📸 **إنستغرام**: الإثنين-الجمعة، 11 صباحاً أو 7-9 مساءً\n\n🎵 **تيك توك**: الثلاثاء-الخميس، 7 مساءً\n\n🔍 **جوجل**: طوال الأسبوع، أوقات الذروة 6-9 مساءً\n\n💡 **نصيحة**: اختبر أوقات مختلفة وحلل النتائج باستخدام أدوات التحليل!",
    en: "Best times to post ads by platform:\n\n📘 **Facebook**: Tue-Thu, 1-4 PM\n\n📸 **Instagram**: Mon-Fri, 11 AM or 7-9 PM\n\n🎵 **TikTok**: Tue-Thu, 7 PM\n\n🔍 **Google**: All week, peak hours 6-9 PM\n\n💡 **Tip**: Test different times and analyze results with analytics tools!",
  },
  product: {
    ar: "لتحسين صفحة المنتج:\n\n✅ **عنوان جذاب** - اجعله واضحاً ومقنعاً\n\n✅ **صور متعددة** - 5-7 صور من زوايا مختلفة\n\n✅ **وصف مفصل** - اذكر الفوائد وليس فقط المميزات\n\n✅ **سعر واضح** - اعرض الخصومات بشكل بارز\n\n✅ **دعوة للعمل قوية** - زر \"اشتري الآن\" واضح\n\n✅ **المراجعات** - اعرض تقييمات العملاء\n\n🚀 استخدم أداة **مولد نصوص المنتجات** لإنشاء وصف احترافي!",
    en: "To improve your product page:\n\n✅ **Compelling title** - Make it clear and persuasive\n\n✅ **Multiple images** - 5-7 photos from different angles\n\n✅ **Detailed description** - Focus on benefits, not just features\n\n✅ **Clear pricing** - Display discounts prominently\n\n✅ **Strong CTA** - Clear \"Buy Now\" button\n\n✅ **Reviews** - Display customer ratings\n\n🚀 Use the **Product Copy Generator** tool to create professional descriptions!",
  },
  pricing: {
    ar: "استراتيجيات التسعير الذكية:\n\n💰 **التسعير النفسي** - استخدم 99 بدلاً من 100\n\n📦 **الحزم والباقات** - اجمع منتجات بسعر مخفض\n\n🎁 **الشحن المجاني** - ادمج تكلفة الشحن في السعر\n\n⏰ **عروض فلاش** - خصومات لفترة محدودة جداً\n\n🏆 **التسعير المتدرج** - قدم 3 خيارات (أساسي، متوسط، متميز)\n\n📊 **تحليل المنافسين** - راقب أسعار المنافسين باستمرار",
    en: "Smart pricing strategies:\n\n💰 **Psychological pricing** - Use 99 instead of 100\n\n📦 **Bundles & packages** - Combine products at a discount\n\n🎁 **Free shipping** - Include shipping in the price\n\n⏰ **Flash sales** - Very limited-time discounts\n\n🏆 **Tiered pricing** - Offer 3 options (basic, standard, premium)\n\n📊 **Competitor analysis** - Monitor competitor prices regularly",
  },
};

export default function SalesChatbot() {
  const { language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: botResponses.default[language],
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("مبيع") || lowerMessage.includes("زياد") || lowerMessage.includes("sales") || lowerMessage.includes("increase")) {
      return botResponses.sales[language];
    }
    if (lowerMessage.includes("وقت") || lowerMessage.includes("إعلان") || lowerMessage.includes("time") || lowerMessage.includes("ads") || lowerMessage.includes("when")) {
      return botResponses.timing[language];
    }
    if (lowerMessage.includes("صفحة") || lowerMessage.includes("منتج") || lowerMessage.includes("تحسين") || lowerMessage.includes("product") || lowerMessage.includes("page") || lowerMessage.includes("improve")) {
      return botResponses.product[language];
    }
    if (lowerMessage.includes("سعر") || lowerMessage.includes("تسعير") || lowerMessage.includes("price") || lowerMessage.includes("pricing")) {
      return botResponses.pricing[language];
    }
    
    return language === "ar" 
      ? "سؤال رائع! 🤔 للحصول على إجابة مخصصة، أنصحك باستخدام أدوات الذكاء الاصطناعي في لوحة التحكم. هل تريد نصائح عن موضوع معين؟\n\n• زيادة المبيعات\n• أفضل وقت للإعلانات\n• تحسين صفحة المنتج\n• استراتيجية التسعير"
      : "Great question! 🤔 For a customized answer, I recommend using the AI tools in your dashboard. Want tips on a specific topic?\n\n• Increasing sales\n• Best time for ads\n• Improving product page\n• Pricing strategy";
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-500 px-4 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
          isRTL ? "left-6" : "right-6",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <TrendingUp className="h-5 w-5" />
        <span className="font-medium">
          {language === "ar" ? "مساعد المبيعات" : "Sales Assistant"}
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 z-50 flex h-[550px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-2xl transition-all duration-300",
          isRTL ? "left-6" : "right-6",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary to-purple-500 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                {language === "ar" ? "مساعد المبيعات الذكي" : "AI Sales Assistant"}
              </h3>
              <p className="text-xs text-white/80">
                {language === "ar" ? "نصائح لتعزيز مبيعاتك" : "Tips to boost your sales"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center justify-around border-b border-border bg-secondary/30 px-4 py-2">
          {[
            { icon: TrendingUp, label: language === "ar" ? "زيادة المبيعات" : "Boost Sales" },
            { icon: Target, label: language === "ar" ? "استهداف" : "Targeting" },
            { icon: Lightbulb, label: language === "ar" ? "أفكار" : "Ideas" },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-background p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.isBot ? "" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.isBot ? "bg-gradient-to-r from-primary to-purple-500 text-white" : "bg-secondary text-foreground"
                )}
              >
                {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                  message.isBot
                    ? "bg-secondary text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-500 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                <span className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Tips */}
        <div className="flex flex-wrap gap-2 border-t border-border bg-card px-4 py-2">
          {salesTips[language].map((tip, index) => (
            <button
              key={index}
              onClick={() => sendMessage(tip)}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {tip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border bg-card p-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
            placeholder={language === "ar" ? "اسأل عن المبيعات..." : "Ask about sales..."}
            className="flex-1 border-0 bg-secondary/50"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(inputValue)}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
