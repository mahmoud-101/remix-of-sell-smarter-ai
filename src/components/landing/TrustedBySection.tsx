import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, CheckCircle } from "lucide-react";

// Real brand logos as SVG components
const NoonLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 w-auto" fill="currentColor">
    <path d="M15 8C9.48 8 5 12.48 5 18v4c0 5.52 4.48 10 10 10s10-4.48 10-10v-4c0-5.52-4.48-10-10-10zm4 14c0 2.21-1.79 4-4 4s-4-1.79-4-4v-4c0-2.21 1.79-4 4-4s4 1.79 4 4v4z"/>
    <path d="M35 8c-5.52 0-10 4.48-10 10v4c0 5.52 4.48 10 10 10s10-4.48 10-10v-4c0-5.52-4.48-10-10-10zm4 14c0 2.21-1.79 4-4 4s-4-1.79-4-4v-4c0-2.21 1.79-4 4-4s4 1.79 4 4v4z"/>
    <path d="M55 8c-5.52 0-10 4.48-10 10v14h6V18c0-2.21 1.79-4 4-4s4 1.79 4 4v14h6V18c0-5.52-4.48-10-10-10z"/>
    <circle cx="75" cy="27" r="5"/>
  </svg>
);

const SallaLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="currentColor">
    <path d="M20 10c-6.63 0-12 5.37-12 12 0 4.97 3.03 9.24 7.34 11.04l1.66-4.71C14.43 27.19 13 24.74 13 22c0-3.87 3.13-7 7-7s7 3.13 7 7c0 .67-.1 1.32-.28 1.93l4.79 1.69c.31-1.14.49-2.35.49-3.62 0-6.63-5.37-12-12-12z"/>
    <path d="M20 16c-3.31 0-6 2.69-6 6 0 2.22 1.21 4.16 3 5.2l1.5-4.27c-.3-.26-.5-.63-.5-1.07 0-.77.62-1.4 1.4-1.4.77 0 1.4.62 1.4 1.4 0 .44-.2.81-.5 1.07l1.5 4.27c1.79-1.04 3-2.98 3-5.2 0-3.31-2.69-6-6-6z"/>
    <text x="38" y="28" fontSize="16" fontWeight="700" fontFamily="system-ui">salla</text>
  </svg>
);

const ZidLogo = () => (
  <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="currentColor">
    <rect x="5" y="10" width="20" height="4" rx="2"/>
    <rect x="5" y="18" width="15" height="4" rx="2"/>
    <rect x="5" y="26" width="20" height="4" rx="2"/>
    <text x="30" y="28" fontSize="18" fontWeight="700" fontFamily="system-ui">zid</text>
  </svg>
);

const ShopifyLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="currentColor">
    <path d="M25.5 6.2c-.1-.1-.3-.1-.4-.1-.1 0-2.4-.2-2.4-.2s-1.6-1.6-1.8-1.7c-.2-.2-.5-.1-.7-.1l-1 .3c-.1-.4-.3-.8-.6-1.2-.8-1.1-2-1.6-3.4-1.6h-.2c-.4-.5-.9-.7-1.3-.7-3.4 0-5 4.2-5.5 6.4-1.3.4-2.2.7-2.3.7-.7.2-.7.2-.8.9-.1.5-1.9 14.6-1.9 14.6l14.3 2.5 7.7-1.9s-3.3-22.3-3.4-22.6c-.1-.2-.2-.3-.3-.3zM17.5 8l-1.2.4V8c0-.6-.1-1.2-.2-1.6.6.1 1 .8 1.4 1.6zm-2.3-1.4c.1.5.2 1.1.2 1.9v.2l-2.5.8c.5-1.8 1.4-2.7 2.3-2.9zm-.9-1.1c.1 0 .3.1.4.2-.9.4-1.9 1.6-2.3 3.9l-2 .6c.6-1.9 2-4.7 3.9-4.7z"/>
    <text x="32" y="26" fontSize="15" fontWeight="600" fontFamily="system-ui">Shopify</text>
  </svg>
);

const WooCommerceLogo = () => (
  <svg viewBox="0 0 140 40" className="h-8 w-auto" fill="currentColor">
    <path d="M8 10c-2.2 0-4 1.8-4 4v12c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V14c0-2.2-1.8-4-4-4H8zm6 4c.6 0 1.1.3 1.4.8l1.6 3.6 1.6-3.6c.3-.5.8-.8 1.4-.8.8 0 1.5.7 1.5 1.5 0 .2 0 .4-.1.6l-2.5 5.5c-.3.6-.9 1-1.5 1s-1.2-.4-1.5-1l-1-2.2-1 2.2c-.3.6-.9 1-1.5 1s-1.2-.4-1.5-1l-2.5-5.5c-.1-.2-.1-.4-.1-.6 0-.8.7-1.5 1.5-1.5.6 0 1.1.3 1.4.8l1.6 3.6 1.6-3.6c.3-.5.8-.8 1.4-.8z"/>
    <text x="32" y="25" fontSize="12" fontWeight="600" fontFamily="system-ui">WooCommerce</text>
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 w-auto">
    <text x="5" y="24" fontSize="16" fontWeight="700" fontFamily="system-ui" fill="currentColor">amazon</text>
    <path d="M5 28c15 6 35 6 50 0" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M50 25l5 3-5 3" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const JarirLogo = () => (
  <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="currentColor">
    <rect x="5" y="8" width="30" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 15h16M12 20h12M12 25h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <text x="40" y="26" fontSize="14" fontWeight="700" fontFamily="system-ui" className="fill-current">جرير</text>
  </svg>
);

const ExtraLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 w-auto" fill="currentColor">
    <rect x="5" y="10" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M10 18h10M15 13v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <text x="30" y="26" fontSize="16" fontWeight="700" fontFamily="system-ui">extra</text>
  </svg>
);

const brandLogos = [
  { name: "Noon", Logo: NoonLogo, color: "text-yellow-500 hover:text-yellow-400" },
  { name: "Salla", Logo: SallaLogo, color: "text-primary hover:text-primary/80" },
  { name: "Zid", Logo: ZidLogo, color: "text-blue-600 hover:text-blue-500" },
  { name: "Shopify", Logo: ShopifyLogo, color: "text-green-600 hover:text-green-500" },
  { name: "WooCommerce", Logo: WooCommerceLogo, color: "text-purple-600 hover:text-purple-500" },
  { name: "Amazon", Logo: AmazonLogo, color: "text-foreground hover:text-foreground/80" },
  { name: "Jarir", Logo: JarirLogo, color: "text-red-600 hover:text-red-500" },
  { name: "Extra", Logo: ExtraLogo, color: "text-blue-500 hover:text-blue-400" },
];

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-16 px-4 border-y border-border/50 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-base text-muted-foreground mb-10 font-medium">
          {isRTL ? "يستخدمه أكثر من 10,000+ صاحب متجر على المنصات التالية" : "Trusted by 10,000+ store owners on these platforms"}
        </p>
        
        {/* Logos Grid with animation */}
        <div className="relative">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6 md:gap-8 items-center justify-items-center">
            {brandLogos.map((brand, index) => (
              <div
                key={index}
                className={`${brand.color} opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
                title={brand.name}
              >
                <brand.Logo />
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4 text-green-500" />
            {isRTL ? "SSL مشفر" : "SSL Encrypted"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
            <Shield className="w-4 h-4 text-green-500" />
            {isRTL ? "دفع آمن" : "Secure Payments"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {isRTL ? "متوافق مع GDPR" : "GDPR Compliant"}
          </div>
        </div>
      </div>
    </section>
  );
}
