import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, TrendingUp, Target, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface LeadData {
  name?: string;
  phone?: string;
  address?: string;
  order_value?: number;
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

export default function SalesChatbot() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: language === "ar" 
        ? "مرحباً! 👋 أنا مساعد المبيعات الذكي. كيف يمكنني مساعدتك في تعزيز مبيعاتك اليوم؟" 
        : "Hello! 👋 I'm your AI Sales Assistant. How can I help boost your sales today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectedLeads, setCollectedLeads] = useState<LeadData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveLead = async (leadData: LeadData) => {
    if (!user) return;
    
    // Merge with existing collected data
    const mergedData = { ...collectedLeads, ...leadData };
    setCollectedLeads(mergedData);

    // Only save if we have at least a name or phone
    if (mergedData.name || mergedData.phone) {
      try {
        const { error } = await supabase.from('leads').upsert({
          user_id: user.id,
          customer_name: mergedData.name,
          phone: mergedData.phone,
          address: mergedData.address,
          order_value: mergedData.order_value,
          notes: `Collected via chatbot on ${new Date().toLocaleDateString()}`,
        }, {
          onConflict: 'user_id'
        });

        if (error && error.code !== '23505') {
          console.error('Error saving lead:', error);
        } else {
          toast({
            title: language === "ar" ? "تم حفظ البيانات" : "Data saved",
            description: language === "ar" 
              ? "تم حفظ بيانات العميل بنجاح" 
              : "Customer data saved successfully",
          });
        }
      } catch (err) {
        console.error('Error saving lead:', err);
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      }));
      conversationHistory.push({ role: 'user', content: text });

      const { data, error } = await supabase.functions.invoke('sales-chat', {
        body: { 
          messages: conversationHistory,
          language 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Save lead data if extracted
      if (data.leadData) {
        await saveLead(data.leadData);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.content || (language === "ar" 
          ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." 
          : "Sorry, an error occurred. Please try again."),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === "ar" 
          ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." 
          : "Sorry, a connection error occurred. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
                {language === "ar" ? "مدعوم بالذكاء الاصطناعي" : "Powered by AI"}
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
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-500 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">
                  {language === "ar" ? "جاري التفكير..." : "Thinking..."}
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
              disabled={isLoading}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
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
            placeholder={language === "ar" ? "اسأل أي سؤال عن المبيعات..." : "Ask any sales question..."}
            className="flex-1 border-0 bg-secondary/50"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => sendMessage(inputValue)}
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}
