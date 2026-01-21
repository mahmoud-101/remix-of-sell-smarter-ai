import { useState } from "react";
import { Download, FileText, FileCode, File, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface VariationContent {
  variations: string[] | string[][];
  selectedIndex: number;
}

interface ExportButtonsProps {
  content: string | Record<string, string> | Record<string, VariationContent>;
  filename?: string;
}

export function ExportButtons({ content, filename = "content" }: ExportButtonsProps) {
  const { isRTL, t } = useLanguage();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const getValueAsString = (value: string | VariationContent): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'variations' in value) {
      const current = value.variations[value.selectedIndex];
      return Array.isArray(current) ? current.join('\n') : current;
    }
    return String(value);
  };

  const getFullContent = (): string => {
    return Object.entries(content)
      .map(([key, value]) => `${key.toUpperCase()}\n${"=".repeat(20)}\n${getValueAsString(value)}`)
      .join("\n\n");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(getFullContent());
    toast({
      title: t("copied"),
      description: isRTL ? "تم نسخ كل المحتوى" : "All content copied to clipboard",
    });
  };

  const formatContent = (format: "txt" | "html" | "md" | "docx" | "pdf"): string => {
    const entries = typeof content === "string" 
      ? [["content", content]] 
      : Object.entries(content).map(([key, value]) => [key, getValueAsString(value)]);
    
    switch (format) {
      case "txt":
        return entries.map(([key, value]) => `${key.toUpperCase()}\n${"=".repeat(40)}\n${value}\n`).join("\n\n");
      
      case "md":
        return entries.map(([key, value]) => `## ${key}\n\n${value}`).join("\n\n---\n\n");
      
      case "html":
        const htmlContent = entries.map(([key, value]) => `
          <section style="margin-bottom: 24px;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${key}</h2>
            <p style="line-height: 1.6; white-space: pre-line;">${value}</p>
          </section>
        `).join("");
        return `<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: ${isRTL ? 'Tajawal, ' : ''}system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fafafa;
      color: #1f2937;
    }
    h1 { color: #6366f1; margin-bottom: 32px; }
  </style>
</head>
<body>
  <h1>${filename}</h1>
  ${htmlContent}
</body>
</html>`;

      case "docx":
        return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
</head>
<body style="font-family: ${isRTL ? 'Tajawal, ' : ''}Calibri, sans-serif; direction: ${isRTL ? 'rtl' : 'ltr'};">
  ${entries.map(([key, value]) => `
    <h2 style="color: #6366f1;">${key}</h2>
    <p style="line-height: 1.6;">${value.replace(/\n/g, '<br>')}</p>
    <hr>
  `).join("")}
</body>
</html>`;

      default:
        return entries.map(([key, value]) => `${key}: ${value}`).join("\n\n");
    }
  };

  const downloadFile = (format: "txt" | "html" | "md" | "docx" | "pdf") => {
    setExporting(format);
    
    try {
      const formatted = formatContent(format);
      const mimeTypes: Record<string, string> = {
        txt: "text/plain",
        md: "text/markdown",
        html: "text/html",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        pdf: "application/pdf",
      };

      if (format === "pdf") {
        const htmlContent = formatContent("html");
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
        setExporting(null);
        return;
      }

      const blob = new Blob([formatted], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format === "docx" ? "doc" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: isRTL ? "تم التصدير!" : "Exported!",
        description: isRTL ? `تم تصدير الملف بصيغة ${format.toUpperCase()}` : `File exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل تصدير الملف" : "Failed to export file",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const exportFormats = [
    { id: "txt", label: isRTL ? "نص عادي" : "Plain Text", icon: FileText },
    { id: "md", label: isRTL ? "ماركداون" : "Markdown", icon: FileCode },
    { id: "html", label: "HTML", icon: FileCode },
    { id: "docx", label: isRTL ? "وورد" : "Word", icon: File },
    { id: "pdf", label: "PDF", icon: File },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyAll}>
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {exportFormats.map((format) => (
            <DropdownMenuItem
              key={format.id}
              onClick={() => downloadFile(format.id as any)}
              disabled={!!exporting}
            >
              <format.icon className="w-4 h-4 mr-2" />
              {format.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
