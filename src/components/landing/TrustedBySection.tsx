import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, CheckCircle } from "lucide-react";
import shopifyLogoUrl from "@/assets/shopify-logo.svg";

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-16 px-4 border-y border-border/50 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-base text-muted-foreground mb-10 font-medium">
          {isRTL
            ? "متوافق مع أكبر منصات التجارة الإلكترونية"
            : "Compatible with the largest e-commerce platforms"}
        </p>

        {/* Shopify Logo */}
        <div className="flex justify-center items-center">
          <div className="opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer">
            <img
              src={shopifyLogoUrl}
              alt="Shopify"
              className="h-10 w-auto max-w-[220px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mt-12 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <Lock className="w-4 h-4 text-primary" />
            {isRTL ? "SSL مشفر" : "SSL Encrypted"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <Shield className="w-4 h-4 text-primary" />
            {isRTL ? "دفع آمن" : "Secure Payments"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            {isRTL ? "متوافق مع GDPR" : "GDPR Compliant"}
          </div>
        </div>
      </div>
    </section>
  );
}
