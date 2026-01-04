import { useLanguage } from "@/contexts/LanguageContext";

const brands = [
  "Noon", "Souq", "Namshi", "Jarir", "Extra",
  "Salla", "Zid", "Shopify", "WooCommerce", "Magento"
];

export default function TrustedBySection() {
  const { isRTL } = useLanguage();

  return (
    <section className="py-12 px-4 border-y border-border/50 bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <p className="text-center text-sm text-muted-foreground mb-8">
          {isRTL ? "يستخدمه أصحاب المتاجر على" : "Trusted by store owners on"}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="text-lg md:text-xl font-bold text-muted-foreground/80 hover:text-foreground transition-colors cursor-default"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
