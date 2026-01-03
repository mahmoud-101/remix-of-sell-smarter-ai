import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Lock, Eye, Database, Bell, Users, FileText } from "lucide-react";

export default function Privacy() {
  const { isRTL } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: "البيانات التي نجمعها",
      content: `نجمع البيانات التالية لتقديم خدماتنا:
• معلومات الحساب: الاسم، البريد الإلكتروني
• بيانات الاستخدام: المحتوى المُولّد وتفضيلات اللغة
• بيانات تقنية: نوع المتصفح، عنوان IP (مجهول الهوية)

لا نجمع بيانات الدفع مباشرة - يتم التعامل معها عبر مزودي خدمات موثوقين.`
    },
    {
      icon: Lock,
      title: "كيف نحمي بياناتك",
      content: `نستخدم أحدث تقنيات الحماية:
• تشفير البيانات أثناء النقل (TLS 1.3)
• تشفير البيانات المخزنة (AES-256)
• المصادقة الآمنة مع حماية من هجمات القوة العمياء
• فحوصات أمنية دورية
• سياسات الوصول المحدود للموظفين`
    },
    {
      icon: Eye,
      title: "استخدام البيانات",
      content: `نستخدم بياناتك فقط للأغراض التالية:
• تقديم خدمات توليد المحتوى
• تحسين تجربة المستخدم
• إرسال إشعارات مهمة (اختياري)
• تحليلات مجهولة الهوية لتحسين الخدمة

لا نبيع بياناتك أبداً لأطراف ثالثة.`
    },
    {
      icon: Users,
      title: "مشاركة البيانات",
      content: `نشارك بياناتك فقط مع:
• مزودي الخدمات الضروريين (استضافة، معالجة الدفع)
• السلطات القانونية عند الطلب الرسمي

جميع الشركاء ملتزمون بمعايير الخصوصية الصارمة.`
    },
    {
      icon: Bell,
      title: "حقوقك",
      content: `لديك الحق في:
• الوصول إلى بياناتك الشخصية
• تصحيح البيانات غير الدقيقة
• حذف حسابك وجميع البيانات المرتبطة
• تصدير بياناتك
• إلغاء الاشتراك في الإشعارات التسويقية

للممارسة أي من هذه الحقوق، تواصل معنا.`
    },
    {
      icon: FileText,
      title: "ملفات تعريف الارتباط",
      content: `نستخدم ملفات تعريف الارتباط الضرورية فقط:
• ملفات الجلسة للحفاظ على تسجيل الدخول
• تفضيلات اللغة والمظهر

لا نستخدم ملفات تتبع إعلانية أو تحليلات تابعة لأطراف ثالثة.`
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.
          </p>
          <p className="text-sm text-muted-foreground">
            آخر تحديث: يناير 2026
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {sections.map((section, index) => (
            <div key={index} className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-primary" />
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
          <h2 className="text-lg font-semibold mb-2">أسئلة حول الخصوصية؟</h2>
          <p className="text-muted-foreground mb-4">
            إذا كان لديك أي استفسارات حول سياسة الخصوصية أو كيفية التعامل مع بياناتك، تواصل معنا.
          </p>
          <a
            href="mailto:privacy@sellgenius.app"
            className="text-primary hover:underline font-medium"
          >
            privacy@sellgenius.app
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
