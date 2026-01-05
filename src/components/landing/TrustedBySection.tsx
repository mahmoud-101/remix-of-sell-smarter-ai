import { useLanguage } from "@/contexts/LanguageContext";

// Brand logos as SVG components for better quality
const brandLogos = [
  {
    name: "Noon",
    logo: (
      <svg viewBox="0 0 100 32" className="h-8 w-auto" fill="currentColor">
        <text x="0" y="24" fontWeight="bold" fontSize="24" fontFamily="system-ui">noon</text>
      </svg>
    ),
    color: "text-yellow-500"
  },
  {
    name: "Salla",
    logo: (
      <svg viewBox="0 0 80 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="24" fontWeight="bold" fontSize="22" fontFamily="system-ui">salla</text>
      </svg>
    ),
    color: "text-primary"
  },
  {
    name: "Zid",
    logo: (
      <svg viewBox="0 0 60 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="24" fontWeight="bold" fontSize="24" fontFamily="system-ui">zid</text>
      </svg>
    ),
    color: "text-blue-500"
  },
  {
    name: "Shopify",
    logo: (
      <svg viewBox="0 0 109 32" className="h-7 w-auto" fill="currentColor">
        <path d="M19.48 5.43c-.01-.1-.08-.15-.14-.15-.06 0-1.14-.02-1.14-.02s-.89-.89-.99-.98c-.09-.1-.27-.07-.34-.05 0 0-.18.06-.48.15-.03-.08-.08-.2-.14-.34-.21-.5-.52-.96-1.1-1.2-.12-.05-.25-.09-.39-.12-.05-.13-.08-.26-.12-.38-.31-.94-.87-1.69-1.77-1.73-1.43-.06-2.33 1.29-2.66 2.11-.85.26-1.45.45-1.53.47-.48.15-.49.17-.55.62-.05.34-1.3 10.02-1.3 10.02L12 16.37l7.47-1.62s0-9.23-.01-9.32zm-3.63-.9c-.32.1-.68.21-1.07.33 0-.55-.08-1.33-.33-2 .82.16 1.22.91 1.4 1.67zm-1.76.54c-.72.22-1.51.47-2.31.71.22-.86.65-1.71 1.17-2.27.2-.21.47-.45.78-.59.31.63.37 1.52.36 2.15zM13.58.8c.25 0 .46.05.65.16-.29.14-.57.36-.83.64-.69.74-1.22 1.9-1.43 3.02-.62.19-1.23.38-1.79.55C10.59 2.76 11.78.83 13.58.8z"/>
        <path d="M19.34 5.28c-.06 0-1.14-.02-1.14-.02s-.89-.89-.99-.98c-.04-.04-.09-.06-.14-.07v12.54l7.47-1.62s-5.2-9.85-5.21-9.85z"/>
        <text x="28" y="22" fontWeight="600" fontSize="14" fontFamily="system-ui">Shopify</text>
      </svg>
    ),
    color: "text-green-600"
  },
  {
    name: "WooCommerce",
    logo: (
      <svg viewBox="0 0 130 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="22" fontWeight="600" fontSize="14" fontFamily="system-ui">WooCommerce</text>
      </svg>
    ),
    color: "text-purple-600"
  },
  {
    name: "Amazon",
    logo: (
      <svg viewBox="0 0 100 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="22" fontWeight="bold" fontSize="16" fontFamily="system-ui">amazon</text>
        <path d="M5 26 Q50 32 95 26" stroke="currentColor" strokeWidth="2" fill="none" className="text-orange-500"/>
      </svg>
    ),
    color: "text-foreground"
  },
  {
    name: "Jarir",
    logo: (
      <svg viewBox="0 0 70 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="22" fontWeight="bold" fontSize="16" fontFamily="system-ui">جرير</text>
      </svg>
    ),
    color: "text-red-600"
  },
  {
    name: "Extra",
    logo: (
      <svg viewBox="0 0 80 32" className="h-7 w-auto" fill="currentColor">
        <text x="0" y="22" fontWeight="bold" fontSize="16" fontFamily="system-ui">extra</text>
      </svg>
    ),
    color: "text-blue-600"
  },
];

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-12 px-4 border-y border-border/50 bg-secondary/20 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-sm text-muted-foreground mb-8">
          {isRTL ? "يستخدمه أكثر من 10,000+ صاحب متجر على" : "Trusted by 10,000+ store owners on"}
        </p>
        
        {/* Infinite scroll animation */}
        <div className="relative">
          <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap animate-fade-in">
            {brandLogos.map((brand, index) => (
              <div
                key={index}
                className={`${brand.color} opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer`}
                title={brand.name}
              >
                {brand.logo}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {isRTL ? "SSL مشفر" : "SSL Encrypted"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {isRTL ? "دفع آمن" : "Secure Payments"}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {isRTL ? "متوافق مع GDPR" : "GDPR Compliant"}
          </div>
        </div>
      </div>
    </section>
  );
}
