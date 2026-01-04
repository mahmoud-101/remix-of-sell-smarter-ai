import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
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

const quickReplies = {
  ar: [
    "ما هي الخطط المتاحة؟",
    "كيف أبدأ؟",
    "هل هناك تجربة مجانية؟",
    "أريد عرض توضيحي",
  ],
  en: [
    "What plans are available?",
    "How do I get started?",
    "Is there a free trial?",
    "I want a demo",
  ],
};

const botResponses: Record<string, { ar: string; en: string }> = {
  default: {
    ar: "مرحباً! أنا مساعد سيل جينيوس. كيف يمكنني مساعدتك اليوم؟ 🚀",
    en: "Hello! I'm the SellGenius assistant. How can I help you today? 🚀",
  },
  plans: {
    ar: "لدينا 4 خطط:\n\n🆓 **مجاني**: 5 توليدات/شهر\n💎 **Start ($5/شهر)**: 50 توليد + دعم أساسي\n🚀 **Pro ($10/شهر)**: 200 توليد + دعم أولوية\n🏢 **Enterprise ($20/شهر)**: غير محدود + دعم مخصص\n\nما الخطة التي تناسبك؟",
    en: "We have 4 plans:\n\n🆓 **Free**: 5 generations/month\n💎 **Start ($5/mo)**: 50 generations + basic support\n🚀 **Pro ($10/mo)**: 200 generations + priority support\n🏢 **Enterprise ($20/mo)**: Unlimited + dedicated support\n\nWhich plan suits you?",
  },
  start: {
    ar: "البدء سهل جداً! 🎉\n\n1. سجل حساب مجاني\n2. اختر أداة الذكاء الاصطناعي\n3. أدخل تفاصيل منتجك\n4. احصل على محتوى احترافي فوراً!\n\nهل تريد التسجيل الآن؟",
    en: "Getting started is easy! 🎉\n\n1. Create a free account\n2. Choose an AI tool\n3. Enter your product details\n4. Get professional content instantly!\n\nWant to sign up now?",
  },
  trial: {
    ar: "نعم! 🎁 لدينا تجربة مجانية لمدة 14 يوم بدون بطاقة ائتمان. يمكنك تجربة جميع الأدوات بحرية قبل الاشتراك.",
    en: "Yes! 🎁 We have a 14-day free trial with no credit card required. You can try all tools freely before subscribing.",
  },
  demo: {
    ar: "بالتأكيد! يمكنك مشاهدة عرض توضيحي مباشر من خلال الدخول للوحة التحكم. جرب أي أداة مجاناً وشاهد النتائج فوراً! 🎬",
    en: "Absolutely! You can see a live demo by entering the dashboard. Try any tool for free and see results instantly! 🎬",
  },
};

export default function WhatsAppChatbot() {
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

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("خط") || lowerMessage.includes("plan") || lowerMessage.includes("price") || lowerMessage.includes("سعر")) {
      return botResponses.plans[language];
    }
    if (lowerMessage.includes("بد") || lowerMessage.includes("start") || lowerMessage.includes("begin") || lowerMessage.includes("كيف")) {
      return botResponses.start[language];
    }
    if (lowerMessage.includes("تجرب") || lowerMessage.includes("trial") || lowerMessage.includes("free") || lowerMessage.includes("مجان")) {
      return botResponses.trial[language];
    }
    if (lowerMessage.includes("عرض") || lowerMessage.includes("demo") || lowerMessage.includes("توضيح")) {
      return botResponses.demo[language];
    }
    
    return language === "ar" 
      ? "شكراً لرسالتك! فريق المبيعات سيتواصل معك قريباً على واتساب. هل لديك سؤال آخر؟"
      : "Thanks for your message! Our sales team will contact you soon on WhatsApp. Any other questions?";
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

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      language === "ar" 
        ? "مرحباً، أريد معرفة المزيد عن سيل جينيوس"
        : "Hello, I want to learn more about SellGenius"
    );
    window.open(`https://wa.me/1234567890?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
          isRTL ? "left-6" : "right-6",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="font-medium">
          {language === "ar" ? "تحدث معنا" : "Chat with us"}
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl transition-all duration-300",
          isRTL ? "left-6" : "right-6",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#25D366] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">
                {language === "ar" ? "مساعد المبيعات" : "Sales Assistant"}
              </h3>
              <p className="text-xs text-white/80">
                {language === "ar" ? "متصل الآن" : "Online now"}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-secondary/30 p-4 space-y-3">
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
                  message.isBot ? "bg-[#25D366] text-white" : "bg-primary text-primary-foreground"
                )}
              >
                {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line",
                  message.isBot
                    ? "bg-card text-foreground rounded-tl-sm"
                    : "bg-[#25D366] text-white rounded-tr-sm"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 border-t border-border bg-card px-4 py-2">
          {quickReplies[language].map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="rounded-full border border-[#25D366] px-3 py-1 text-xs text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-border bg-card p-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
            placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
            className="flex-1 border-0 bg-secondary/50"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(inputValue)}
            className="bg-[#25D366] hover:bg-[#20BD5A]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* WhatsApp CTA */}
        <button
          onClick={openWhatsApp}
          className="flex items-center justify-center gap-2 bg-[#128C7E] py-2 text-sm text-white transition-colors hover:bg-[#0F7A6D]"
        >
          <MessageCircle className="h-4 w-4" />
          {language === "ar" ? "تابع على واتساب" : "Continue on WhatsApp"}
        </button>
      </div>
    </>
  );
}
