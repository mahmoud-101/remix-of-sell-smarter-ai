import { useLanguage } from "@/contexts/LanguageContext";
import { Users, FileText, TrendingUp, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: { ar: string; en: string };
  color: string;
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: { ar: "مستخدم نشط", en: "Active Users" },
    color: "text-primary"
  },
  {
    icon: FileText,
    value: 500000,
    suffix: "+",
    label: { ar: "محتوى تم توليده", en: "Content Generated" },
    color: "text-green-500"
  },
  {
    icon: TrendingUp,
    value: 40,
    suffix: "%",
    label: { ar: "متوسط زيادة المبيعات", en: "Avg. Sales Increase" },
    color: "text-accent"
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "/5",
    label: { ar: "تقييم العملاء", en: "Customer Rating" },
    color: "text-yellow-500"
  }
];

function AnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(value * easeOut * 10) / 10);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(value);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`stat-${value}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
    return num.toLocaleString();
  };

  return (
    <span id={`stat-${value}`}>
      {typeof value === "number" && value < 100 
        ? count.toFixed(value % 1 !== 0 ? 1 : 0) 
        : formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="glass-card rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-3xl md:text-4xl font-bold gradient-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.label[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
