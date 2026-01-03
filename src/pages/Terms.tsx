import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from "lucide-react";

export default function Terms() {
  const { isRTL } = useLanguage();

  const sections = [
    {
      title: "قبول الشروط",
      content: `باستخدامك لمنصة SellGenius، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الخدمة.`
    },
    {
      title: "وصف الخدمة",
      content: `SellGenius هي منصة لتوليد المحتوى التسويقي باستخدام الذكاء الاصطناعي. تشمل خدماتنا:
• توليد نصوص المنتجات
• إنشاء نصوص الإعلانات
• تخطيط الحملات التسويقية
• تحليل المنافسين
• نصائح التصميم`
    },
    {
      title: "حساب المستخدم",
      content: `• يجب أن تكون 18 عاماً أو أكثر لاستخدام الخدمة
• أنت مسؤول عن الحفاظ على سرية معلومات حسابك
• يجب تقديم معلومات دقيقة وحديثة
• لا يجوز مشاركة حسابك مع آخرين`
    },
    {
      title: "الاستخدام المقبول",
      icon: CheckCircle,
      content: `يُسمح لك باستخدام الخدمة للأغراض التالية:
• إنشاء محتوى تسويقي لمنتجاتك وخدماتك
• تحسين استراتيجياتك التسويقية
• تحليل المنافسين لأغراض تجارية مشروعة`
    },
    {
      title: "الاستخدام المحظور",
      icon: XCircle,
      content: `يُحظر استخدام الخدمة للأغراض التالية:
• إنشاء محتوى مضلل أو احتيالي
• انتهاك حقوق الملكية الفكرية للآخرين
• إنشاء محتوى غير قانوني أو ضار
• محاولة اختراق أو تعطيل الخدمة
• إعادة بيع الخدمة دون إذن`
    },
    {
      title: "الملكية الفكرية",
      content: `• المحتوى الذي تولده باستخدام خدمتنا يعود لك
• جميع حقوق المنصة والتقنية المستخدمة محفوظة لـ SellGenius
• لا يجوز نسخ أو توزيع أو تعديل أي جزء من المنصة`
    },
    {
      title: "إخلاء المسؤولية",
      icon: AlertTriangle,
      content: `• الخدمة مقدمة "كما هي" دون ضمانات
• لا نضمن دقة أو ملاءمة المحتوى المُولّد
• أنت مسؤول عن مراجعة المحتوى قبل استخدامه
• لا نتحمل مسؤولية أي أضرار ناتجة عن استخدام الخدمة`
    },
    {
      title: "التعديلات",
      content: `نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل التطبيق.`
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">الشروط والأحكام</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة SellGenius.
          </p>
          <p className="text-sm text-muted-foreground">
            آخر تحديث: يناير 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {section.icon ? (
                    <section.icon className={`w-4 h-4 ${
                      section.icon === XCircle ? "text-destructive" :
                      section.icon === AlertTriangle ? "text-yellow-500" :
                      "text-green-500"
                    }`} />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">أسئلة قانونية؟</h2>
          <p className="text-muted-foreground mb-4">
            إذا كان لديك أي استفسارات حول الشروط والأحكام، تواصل معنا.
          </p>
          <a
            href="mailto:legal@sellgenius.app"
            className="text-primary hover:underline font-medium"
          >
            legal@sellgenius.app
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
