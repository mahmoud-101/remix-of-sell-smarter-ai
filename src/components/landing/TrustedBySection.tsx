import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, CheckCircle } from "lucide-react";

// Shopify SVG Logo (official)
const ShopifyLogo = () => (
  <svg viewBox="0 0 109.5 40" className="h-10 w-auto" aria-label="Shopify">
    <path fill="#95BF47" d="M95.9 7.7c-.1-.8-.7-1.2-1.2-1.2s-1.2-.1-1.7-.1c-.6 0-1.2.1-1.9.2-.1-.7-.4-1.4-.8-2-.9-1.5-2.2-2.3-3.8-2.3h-.3c-.5-.6-1.1-.9-1.6-.9-4 .1-5.9 5-6.5 7.5l-2.7.8c-.8.3-.8.3-.9 1.1l-2.1 15.9 15.4 2.7L95.9 7.7z"/>
    <path fill="#5E8E3E" d="M93.5 6.5c-.5 0-1.2.1-1.9.2-.1-.7-.4-1.4-.8-2-.9-1.5-2.2-2.3-3.8-2.3h-.3c-.5-.6-1.1-.9-1.6-.9-4 .1-5.9 5-6.5 7.5l-2.7.8.1-.1s1.4-4.3 4.5-5.4c.5-.2 1-.3 1.5-.2.4.1.8.3 1.1.6.4.3.7.6.9 1 .4.7.6 1.5.7 2.3l.9-.3c.6-.2 1.1-.3 1.7-.4.3 0 .6 0 .9.1.3.1.5.2.7.4.4.4.6 1 .6 1.7l4 21 6.1-1.3-6-22.7c-.1-.8-.7-1.2-1.2-1.2z"/>
    <path fill="#FFF" d="M86.1 10.4l-.9 3.4s-1-.5-2.2-.4c-1.8.1-1.8 1.2-1.8 1.5.1 1.6 4.2 1.9 4.4 5.6.2 2.9-1.5 4.9-4 5-3 .2-4.6-1.6-4.6-1.6l.6-2.7s1.6 1.2 2.9 1.1c.8 0 1.2-.7 1.1-1.2-.1-2.1-3.5-2-3.7-5.3-.1-2.8 1.6-5.6 5.6-5.8 1.6-.1 2.6.4 2.6.4z"/>
    <g fill="currentColor">
      <path d="M36.3 24.4c-1.1-.6-1.6-1.1-1.6-1.8 0-.9.8-1.4 2-1.4 1.4 0 2.7.6 2.7.6l1-3s-.9-.7-3.6-.7c-3.8 0-6.4 2.1-6.4 5.2 0 1.7 1.2 3 2.8 4 1.3.8 1.8 1.3 1.8 2.1 0 .8-.7 1.5-1.9 1.5-1.8 0-3.6-.9-3.6-.9l-1.1 3s1.6 1 4.3 1c3.9 0 6.6-1.9 6.6-5.3 0-1.8-1.4-3.2-3-4.3zM51.3 16c-1.9 0-3.4.9-4.6 2.3l-.1-.1 1.7-8.7h-4.4L39.8 32h4.4l1.5-7.6c.6-2.9 2.1-4.7 3.5-4.7 1 0 1.4.7 1.4 1.7 0 .6-.1 1.4-.2 2l-1.7 8.6h4.4l1.7-8.9c.2-.9.3-2 .3-2.7 0-2.5-1.3-4.4-3.8-4.4zM62.8 16c-5.3 0-8.8 4.8-8.8 10.1 0 3.4 2.1 6.1 6.1 6.1 5.2 0 8.7-4.7 8.7-10.1 0-3.1-1.8-6.1-6-6.1zm-2 12.6c-1.5 0-2.2-1.3-2.2-2.9 0-2.5 1.3-6.2 3.7-6.2 1.6 0 2.1 1.4 2.1 2.7 0 2.7-1.3 6.4-3.6 6.4zM79.6 16c-3 0-4.6 2.6-4.6 2.6h-.1l.3-2.4h-3.9c-.2 1.9-.6 4.8-1 7l-2.5 12.9h4.4l1-5.3h.1s.9.6 2.6.6c5.1 0 8.5-5.3 8.5-10.6 0-2.9-1.3-4.8-4.8-4.8zm-3.8 12.7c-1.2 0-1.8-.7-1.8-.7l.7-4c.5-2.7 2-4.5 3.5-4.5 1.4 0 1.8 1.3 1.8 2.5 0 2.9-1.8 6.7-4.2 6.7zM88.1 9.4c-1.4 0-2.5 1.1-2.5 2.6 0 1.3.8 2.2 2.1 2.2h.1c1.4 0 2.5-1 2.5-2.6-.1-1.3-.9-2.2-2.2-2.2zM83.3 32h4.4l2.9-15.6h-4.5L83.3 32zM100 16.4h-3.1l.1-.7c.3-1.5 1.1-2.9 2.6-2.9.8 0 1.4.2 1.4.2l.9-3.5s-.8-.4-2.4-.4c-1.6 0-3.1.4-4.3 1.4-1.5 1.3-2.2 3.1-2.5 4.9l-.1.7h-2.1l-.6 3.3h2.1l-2.2 12.3h4.4l2.2-12.3h3l.6-3z"/>
    </g>
  </svg>
);

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-16 px-4 border-y border-border/50 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-base text-muted-foreground mb-10 font-medium">
          {isRTL ? "متوافق مع أكبر منصات التجارة الإلكترونية" : "Compatible with the largest e-commerce platforms"}
        </p>
        
        {/* Shopify Logo */}
        <div className="flex justify-center items-center">
          <div className="opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer">
            <ShopifyLogo />
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mt-12 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <Lock className="w-4 h-4 text-green-500" />
            {isRTL ? "SSL مشفر" : "SSL Encrypted"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <Shield className="w-4 h-4 text-green-500" />
            {isRTL ? "دفع آمن" : "Secure Payments"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2.5 rounded-full border border-border/50 shadow-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {isRTL ? "متوافق مع GDPR" : "GDPR Compliant"}
          </div>
        </div>
      </div>
    </section>
  );
}
