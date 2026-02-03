import { useState } from "react";
import {
  History as HistoryIcon,
  FileText,
  Megaphone,
  Video,
  Palette,
  Search,
  Filter,
  Clock,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHistory } from "@/hooks/useHistory";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, any> = {
  product: FileText,
  ads: Megaphone,
  reels: Video,
  design: Palette,
  image: ImageIcon,
};

const typeColors: Record<string, string> = {
  product: "from-emerald-500 to-teal-500",
  ads: "from-pink-500 to-rose-500",
  reels: "from-purple-500 to-violet-500",
  design: "from-amber-500 to-orange-500",
  image: "from-blue-500 to-indigo-500",
};

export default function History() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { t, isRTL } = useLanguage();
  const { history, loading, deleteFromHistory } = useHistory();
  const { toast } = useToast();

  const typeLabels: Record<string, { ar: string; en: string }> = {
    product: { ar: "استوديو المنتجات", en: "Product Studio" },
    ads: { ar: "استوديو الإعلانات", en: "Ads Studio" },
    reels: { ar: "استوديو الريلز", en: "Reels Studio" },
    design: { ar: "استوديو الصور", en: "Image Studio" },
    image: { ar: "صور", en: "Images" },
  };

  const filteredHistory = history.filter((item) => {
    const title = item.input_data?.productName || 
                  item.output_data?.title ||
                  item.input_data?.style || 
                  "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.tool_type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    const success = await deleteFromHistory(id);
    if (success) {
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف العنصر بنجاح" : "Item deleted successfully",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getItemTitle = (item: any) => {
    return item.input_data?.productName || 
           item.output_data?.title ||
           item.input_data?.style || 
           (isRTL ? "بدون عنوان" : "Untitled");
  };

  const getItemPreview = (item: any) => {
    const output = item.output_data;
    const input = item.input_data;
    
    if (output?.description) return output.description.substring(0, 100);
    if (output?.headline) return output.headline;
    if (output?.caption) return output.caption;
    if (input?.productDescription) return input.productDescription.substring(0, 100);
    if (output?.imageCount) return isRTL ? `${output.imageCount} صور` : `${output.imageCount} images`;
    if (output?.scenesCount) return isRTL ? `${output.scenesCount} مشاهد` : `${output.scenesCount} scenes`;
    return isRTL ? "لا يوجد معاينة" : "No preview";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold">{isRTL ? "السجل" : "History"}</h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL ? "كل المحتوى المُولّد من جميع الاستوديوهات" : "All generated content from all studios"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            <Input
              placeholder={isRTL ? "بحث في السجل..." : "Search history..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${isRTL ? "pr-10" : "pl-10"}`}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              <SelectValue placeholder={isRTL ? "فلترة" : "Filter"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
              <SelectItem value="product">{isRTL ? "استوديو المنتجات" : "Product Studio"}</SelectItem>
              <SelectItem value="ads">{isRTL ? "استوديو الإعلانات" : "Ads Studio"}</SelectItem>
              <SelectItem value="reels">{isRTL ? "استوديو الريلز" : "Reels Studio"}</SelectItem>
              <SelectItem value="design">{isRTL ? "استوديو الصور" : "Image Studio"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-card rounded-2xl p-8 text-center border">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">{isRTL ? "لا يوجد سجل" : "No history"}</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? (isRTL ? "جرب تغيير الفلتر أو البحث" : "Try adjusting filters or search")
                  : (isRTL ? "ابدأ بتوليد محتوى في أي استوديو وسيظهر هنا" : "Start generating content in any studio and it will appear here")}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const Icon = typeIcons[item.tool_type] || FileText;
              const label = typeLabels[item.tool_type] || { ar: item.tool_type, en: item.tool_type };
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-5 border hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        typeColors[item.tool_type] || "from-gray-500 to-gray-600"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {isRTL ? label.ar : label.en}
                        </span>
                      </div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {getItemTitle(item)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {getItemPreview(item)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
