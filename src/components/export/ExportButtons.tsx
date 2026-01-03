import { Download, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExportButtonsProps {
  content: string | Record<string, string>;
  filename?: string;
}

export function ExportButtons({ content, filename = "content" }: ExportButtonsProps) {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const getFullContent = (): string => {
    if (typeof content === "string") {
      return content;
    }
    return Object.entries(content)
      .map(([key, value]) => `${key.toUpperCase()}\n${"=".repeat(20)}\n${value}`)
      .join("\n\n");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(getFullContent());
    toast({
      title: t("copied"),
      description: isRTL ? "تم نسخ كل المحتوى" : "All content copied to clipboard",
    });
  };

  const downloadAsTxt = () => {
    const blob = new Blob([getFullContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: isRTL ? "تم التحميل" : "Downloaded",
      description: isRTL ? "تم تحميل الملف بنجاح" : "File downloaded successfully",
    });
  };

  const downloadAsMarkdown = () => {
    let mdContent: string;
    if (typeof content === "string") {
      mdContent = content;
    } else {
      mdContent = Object.entries(content)
        .map(([key, value]) => `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${value}`)
        .join("\n\n---\n\n");
    }
    
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: isRTL ? "تم التحميل" : "Downloaded",
      description: isRTL ? "تم تحميل ملف Markdown" : "Markdown file downloaded",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyAll}>
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline">{isRTL ? "نسخ الكل" : "Copy All"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={downloadAsTxt}>
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">TXT</span>
      </Button>
      <Button variant="outline" size="sm" onClick={downloadAsMarkdown}>
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">MD</span>
      </Button>
    </div>
  );
}
