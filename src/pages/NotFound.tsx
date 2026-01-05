import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const suggestedLinks = [
    { to: "/", label: isRTL ? "الصفحة الرئيسية" : "Home Page", icon: Home },
    { to: "/dashboard", label: isRTL ? "لوحة التحكم" : "Dashboard", icon: Sparkles },
    { to: "/signup", label: isRTL ? "إنشاء حساب" : "Create Account", icon: ArrowRight },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="text-center relative max-w-md mx-auto">
        {/* 404 Number with animation */}
        <div className="mb-8 animate-bounce-in">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <Search className="w-10 h-10 text-primary" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-3">
          {isRTL ? "عذراً، الصفحة غير موجودة" : "Oops! Page not found"}
        </h2>
        <p className="text-muted-foreground mb-8">
          {isRTL 
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من الرابط أو العودة للصفحة الرئيسية."
            : "The page you're looking for doesn't exist or has been moved. Please check the URL or return to the homepage."}
        </p>

        {/* Main CTA */}
        <Link to="/">
          <Button variant="hero" size="lg" className="mb-8 group">
            {isRTL ? "العودة للصفحة الرئيسية" : "Back to Homepage"}
            <ArrowRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
          </Button>
        </Link>

        {/* Suggested Links */}
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-4">
            {isRTL ? "أو جرب أحد هذه الروابط:" : "Or try one of these links:"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestedLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="outline" size="sm" className="gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Technical info for developers */}
        <p className="text-xs text-muted-foreground mt-6">
          {isRTL ? "المسار المطلوب:" : "Requested path:"} <code className="text-primary">{location.pathname}</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
