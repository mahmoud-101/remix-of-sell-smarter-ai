import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, MessageSquare, Send, ArrowLeft, Loader2, Phone, MapPin, Clock } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export default function Contact() {
  const { isRTL, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const toggleLanguage = () => setLanguage(language === "ar" ? "en" : "ar");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: isRTL ? "خطأ في البيانات" : "Validation Error",
        description: result.error.errors[0]?.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate sending (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: isRTL ? "تم الإرسال بنجاح! ✉️" : "Message Sent! ✉️",
      description: isRTL 
        ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت."
        : "Thank you for reaching out. We'll get back to you soon.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: isRTL ? "البريد الإلكتروني" : "Email",
      value: "support@sellgenius.app",
      description: isRTL ? "راسلنا في أي وقت" : "Reach out anytime",
    },
    {
      icon: Phone,
      title: isRTL ? "واتساب" : "WhatsApp",
      value: "+966 50 000 0000",
      description: isRTL ? "دعم فوري" : "Instant support",
    },
    {
      icon: Clock,
      title: isRTL ? "ساعات العمل" : "Working Hours",
      value: isRTL ? "9 ص - 6 م (GMT+3)" : "9 AM - 6 PM (GMT+3)",
      description: isRTL ? "الأحد - الخميس" : "Sunday - Thursday",
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">SellGenius</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              {language === "ar" ? "EN" : "عربي"}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
                {isRTL ? "الرئيسية" : "Home"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isRTL ? "تواصل معنا" : "Contact Us"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? "كيف يمكننا مساعدتك؟" : "How Can We Help?"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isRTL 
                ? "فريقنا جاهز للإجابة على استفساراتك ومساعدتك في تحقيق أهدافك."
                : "Our team is ready to answer your questions and help you achieve your goals."}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  {isRTL ? "أرسل لنا رسالة" : "Send Us a Message"}
                </CardTitle>
                <CardDescription>
                  {isRTL 
                    ? "املأ النموذج وسنرد عليك خلال 24 ساعة."
                    : "Fill out the form and we'll respond within 24 hours."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{isRTL ? "الاسم" : "Name"} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{isRTL ? "البريد الإلكتروني" : "Email"} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={isRTL ? "email@example.com" : "email@example.com"}
                        required
                        maxLength={255}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">{isRTL ? "الموضوع" : "Subject"} *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={isRTL ? "موضوع الرسالة" : "Message subject"}
                      required
                      maxLength={200}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">{isRTL ? "الرسالة" : "Message"} *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."}
                      rows={5}
                      required
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground text-end">
                      {formData.message.length}/2000
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRTL ? "جاري الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {isRTL ? "إرسال الرسالة" : "Send Message"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{method.title}</p>
                        <p className="text-sm text-primary">{method.value}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* FAQ Link */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="font-semibold mb-2">
                    {isRTL ? "الأسئلة الشائعة" : "FAQ"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isRTL 
                      ? "قد تجد إجابة سؤالك في الأسئلة الشائعة."
                      : "You might find your answer in our FAQ."}
                  </p>
                  <Link to="/#faq">
                    <Button variant="outline" size="sm" className="w-full">
                      {isRTL ? "عرض الأسئلة الشائعة" : "View FAQ"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SellGenius. {isRTL ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
