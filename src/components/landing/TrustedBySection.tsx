import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, CheckCircle } from "lucide-react";

// Brand logos with proper styling
const brandLogos = [
  { 
    name: "Noon", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Noon_logo.svg",
    bgColor: "bg-yellow-400"
  },
  { 
    name: "Salla", 
    logo: "https://cdn.salla.sa/images/logo/logo-icon.png",
    bgColor: "bg-primary"
  },
  { 
    name: "Zid", 
    logo: "https://zid.store/images/logo.svg",
    bgColor: "bg-blue-600"
  },
  { 
    name: "Shopify", 
    logo: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg",
    bgColor: "bg-green-600"
  },
  { 
    name: "WooCommerce", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg",
    bgColor: "bg-purple-600"
  },
  { 
    name: "Amazon", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    bgColor: "bg-orange-500"
  },
  { 
    name: "Namshi", 
    logo: "https://www.namshi.com/assets/images/namshi-logo.svg",
    bgColor: "bg-black"
  },
  { 
    name: "Extra", 
    logo: "https://www.extra.com/medias/Extra-Logo-New-2024.png?context=bWFzdGVyfGltYWdlc3wxNjQ1N3xpbWFnZS9wbmd8aW1hZ2VzL2hmZi9oNjkvMTQ0ODE2NjU0MTAwMzgucG5nfDM5NWM4ZTM1ZTQ5YmY5ZGE2OGU5OGY1OGI2YmU1ZWU2ZjQ2NTg0ZTM2ZGQ2YzY5ZGQ5ZTk1ZDQ0Yjk4YzQxNzE",
    bgColor: "bg-blue-500"
  },
];

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-16 px-4 border-y border-border/50 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-base text-muted-foreground mb-10 font-medium">
          {isRTL ? "يستخدمه أكثر من 10,000+ صاحب متجر على المنصات التالية" : "Trusted by 10,000+ store owners on these platforms"}
        </p>
        
        {/* Logos Grid */}
        <div className="relative">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 md:gap-10 items-center justify-items-center">
            {brandLogos.map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 w-full opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer animate-fade-in grayscale hover:grayscale-0"
                style={{ animationDelay: `${index * 100}ms` }}
                title={brand.name}
              >
                <span className="text-lg md:text-xl font-bold text-foreground/80 hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
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
