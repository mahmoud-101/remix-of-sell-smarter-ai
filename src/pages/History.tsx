import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ExternalLink,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const typeLabels: Record<string, { ar: string; en: string }> = {
    product: { ar: "استوديو المنتجات", en: "Product Studio" },
    ads: { ar: "استوديو الإعلانات", en: "Ads Studio" },
    reels: { ar: "استوديو الريلز", en: "Reels Studio" },
    design: { ar: "استوديو الصور", en: "Image Studio" },
    image: { ar: "صور", en: "Images" },
  };

  const studioRoutes: Record<string, string> = {
    product: "/dashboard",
    ads: "/dashboard/ads",
    reels: "/dashboard/reels",
    design: "/dashboard/images",
    image: "/dashboard/images",
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

  const handleOpenItem = (item: any) => {
    setSelectedItem(item);
  };

  const handleGoToStudio = (toolType: string) => {
    const route = studioRoutes[toolType] || "/dashboard";
    navigate(route);
  };

  const renderItemContent = (item: any) => {
    const output = item.output_data;
    const input = item.input_data;
    const toolType = item.tool_type;

    return (
      <div className="space-y-4">
        {/* Input Data */}
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">
            {isRTL ? "البيانات المدخلة" : "Input Data"}
          </h4>
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            {input?.productName && (
              <p><span className="font-medium">{isRTL ? "اسم المنتج:" : "Product:"}</span> {input.productName}</p>
            )}
            {input?.style && (
              <p><span className="font-medium">{isRTL ? "الستايل:" : "Style:"}</span> {input.style}</p>
            )}
            {input?.productDescription && (
              <p className="text-sm">{input.productDescription}</p>
            )}
          </div>
        </div>

        {/* Output Data */}
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">
            {isRTL ? "النتائج" : "Output"}
          </h4>
          
          {/* Images */}
          {(toolType === "design" || toolType === "image") && output?.images && (
            <div className="grid grid-cols-2 gap-2">
              {output.images.map((img: any, idx: number) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img.imageUrl || img} 
                    alt={`Generated ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {img.angleAr || img.angle || `صورة ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reels/Video Scripts */}
          {toolType === "reels" && output?.scenes && (
            <div className="space-y-3">
              {output.scenes.map((scene: any, idx: number) => (
                <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{isRTL ? `مشهد ${idx + 1}` : `Scene ${idx + 1}`}</p>
                  {scene.hook && <p className="text-primary font-medium">{scene.hook}</p>}
                  {scene.caption && <p className="text-sm mt-1">{scene.caption}</p>}
                  {scene.cta && <p className="text-sm text-muted-foreground mt-1">CTA: {scene.cta}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Product Content */}
          {toolType === "product" && (
            <div className="space-y-3">
              {output?.title && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{isRTL ? "العنوان" : "Title"}</p>
                  <p>{output.title}</p>
                </div>
              )}
              {output?.description && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{isRTL ? "الوصف" : "Description"}</p>
                  <p className="text-sm">{output.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Ads Content */}
          {toolType === "ads" && (
            <div className="space-y-3">
              {output?.headline && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{isRTL ? "العنوان الرئيسي" : "Headline"}</p>
                  <p className="text-primary font-medium">{output.headline}</p>
                </div>
              )}
              {output?.primaryText && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="font-medium text-sm mb-1">{isRTL ? "النص الأساسي" : "Primary Text"}</p>
                  <p className="text-sm whitespace-pre-wrap">{output.primaryText}</p>
                </div>
              )}
              {output?.variations && output.variations.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">{isRTL ? "الإعلانات" : "Ad Variations"}</p>
                  {output.variations.map((ad: any, idx: number) => (
                    <div key={idx} className="bg-secondary/50 rounded-lg p-3">
                      <p className="font-medium">{ad.headline}</p>
                      <p className="text-sm mt-1">{ad.primaryText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generic fallback */}
          {!output?.images && !output?.scenes && !output?.title && !output?.headline && !output?.variations && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
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
                  onClick={() => handleOpenItem(item)}
                  className="bg-card rounded-xl p-5 border hover:shadow-md transition-shadow group cursor-pointer"
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(item);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedItem && (
                  <>
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        typeColors[selectedItem.tool_type] || "from-gray-500 to-gray-600"
                      } flex items-center justify-center`}
                    >
                      {(() => {
                        const Icon = typeIcons[selectedItem.tool_type] || FileText;
                        return <Icon className="w-4 h-4 text-white" />;
                      })()}
                    </div>
                    <span>{getItemTitle(selectedItem)}</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {selectedItem && renderItemContent(selectedItem)}
            </ScrollArea>
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {selectedItem && formatDate(selectedItem.created_at)}
              </p>
              <Button
                onClick={() => {
                  if (selectedItem) {
                    handleGoToStudio(selectedItem.tool_type);
                    setSelectedItem(null);
                  }
                }}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {isRTL ? "فتح الاستوديو" : "Open Studio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
