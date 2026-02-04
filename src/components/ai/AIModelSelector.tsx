import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Brain, Image as ImageIcon, Star, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type ToolType = "image" | "reels" | "ads" | "product" | "seo" | "analysis" | "ugc" | "video";

export interface AIModel {
  id: string;
  name: string;
  nameAr: string;
  provider: "lovable" | "openrouter" | "runware";
  description: string;
  descriptionAr: string;
  icon: "zap" | "brain" | "sparkles" | "image" | "star" | "video";
}

// Best 2 models per tool type - curated for optimal results
const TOOL_MODELS: Record<ToolType, AIModel[]> = {
  image: [
    {
      id: "runware:100@1",
      name: "Runware Flux",
      nameAr: "رانوير فلكس",
      provider: "runware",
      description: "Fast & high quality - Recommended",
      descriptionAr: "سريع وعالي الجودة - موصى به",
      icon: "image",
    },
    {
      id: "civitai:43331@176425",
      name: "Majic Mix Realistic",
      nameAr: "ماجيك ميكس",
      provider: "runware",
      description: "Best for fashion & portraits",
      descriptionAr: "الأفضل للأزياء والبورتريه",
      icon: "star",
    },
  ],
  ugc: [
    {
      id: "civitai:43331@176425",
      name: "Majic Mix Realistic",
      nameAr: "ماجيك ميكس",
      provider: "runware",
      description: "Ultra-realistic UGC - Recommended",
      descriptionAr: "صور UGC واقعية - موصى به",
      icon: "star",
    },
    {
      id: "civitai:4201@130072",
      name: "Realistic Vision",
      nameAr: "الرؤية الواقعية",
      provider: "runware",
      description: "Photorealistic quality",
      descriptionAr: "جودة فوتوغرافية",
      icon: "image",
    },
  ],
  reels: [
    {
      id: "runware:100@1",
      name: "Runware Flux",
      nameAr: "رانوير فلكس",
      provider: "runware",
      description: "Fast scene generation - Recommended",
      descriptionAr: "توليد مشاهد سريع - موصى به",
      icon: "video",
    },
    {
      id: "civitai:43331@176425",
      name: "Majic Mix Realistic",
      nameAr: "ماجيك ميكس",
      provider: "runware",
      description: "Realistic scenes",
      descriptionAr: "مشاهد واقعية",
      icon: "image",
    },
  ],
  video: [
    {
      id: "runware:100@1",
      name: "Runware Flux",
      nameAr: "رانوير فلكس",
      provider: "runware",
      description: "Video generation - Recommended",
      descriptionAr: "توليد فيديو - موصى به",
      icon: "video",
    },
    {
      id: "civitai:43331@176425",
      name: "Majic Mix Realistic",
      nameAr: "ماجيك ميكس",
      provider: "runware",
      description: "Realistic video frames",
      descriptionAr: "إطارات فيديو واقعية",
      icon: "image",
    },
  ],
  ads: [
    {
      id: "google/gemini-3-flash-preview",
      name: "Gemini 3 Flash",
      nameAr: "جيميني 3 فلاش",
      provider: "lovable",
      description: "Fast & creative - Recommended",
      descriptionAr: "سريع وإبداعي - موصى به",
      icon: "sparkles",
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      nameAr: "كلود 3.5 سونيت",
      provider: "openrouter",
      description: "Excellent for creative copy",
      descriptionAr: "ممتاز للنصوص الإبداعية",
      icon: "brain",
    },
  ],
  product: [
    {
      id: "google/gemini-2.5-pro",
      name: "Gemini Pro",
      nameAr: "جيميني برو",
      provider: "lovable",
      description: "Best for product content - Recommended",
      descriptionAr: "الأفضل لمحتوى المنتجات - موصى به",
      icon: "brain",
    },
    {
      id: "openai/gpt-5",
      name: "GPT-5",
      nameAr: "جي بي تي 5",
      provider: "lovable",
      description: "Powerful all-rounder",
      descriptionAr: "قوي ومتعدد الاستخدامات",
      icon: "star",
    },
  ],
  seo: [
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini Flash",
      nameAr: "جيميني فلاش",
      provider: "lovable",
      description: "Fast SEO optimization - Recommended",
      descriptionAr: "تحسين SEO سريع - موصى به",
      icon: "zap",
    },
    {
      id: "google/gemini-2.5-flash-lite",
      name: "Gemini Flash Lite",
      nameAr: "جيميني فلاش لايت",
      provider: "lovable",
      description: "Fastest & cheapest",
      descriptionAr: "الأسرع والأرخص",
      icon: "zap",
    },
  ],
  analysis: [
    {
      id: "google/gemini-2.5-pro",
      name: "Gemini Pro",
      nameAr: "جيميني برو",
      provider: "lovable",
      description: "Best for analysis - Recommended",
      descriptionAr: "الأفضل للتحليل - موصى به",
      icon: "brain",
    },
    {
      id: "openai/gpt-5.2",
      name: "GPT-5.2",
      nameAr: "جي بي تي 5.2",
      provider: "lovable",
      description: "Enhanced reasoning",
      descriptionAr: "تحليل متقدم",
      icon: "star",
    },
  ],
};

// Flat list for backward compatibility
export const AI_MODELS: AIModel[] = Object.values(TOOL_MODELS).flat();

// Get recommended model for a tool (first one is always recommended)
export const getRecommendedModel = (toolType: ToolType): string => {
  return TOOL_MODELS[toolType]?.[0]?.id || "google/gemini-2.5-flash";
};

// Get models suitable for a specific tool (only best 2)
export const getModelsForTool = (toolType: ToolType): AIModel[] => {
  return TOOL_MODELS[toolType] || TOOL_MODELS.product;
};

interface AIModelSelectorProps {
  toolType: ToolType;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export function AIModelSelector({
  toolType,
  selectedModel,
  onModelChange,
  className = "",
}: AIModelSelectorProps) {
  const { isRTL } = useLanguage();
  const recommendedModel = getRecommendedModel(toolType);
  const availableModels = getModelsForTool(toolType);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "zap": return <Zap className="w-4 h-4" />;
      case "brain": return <Brain className="w-4 h-4" />;
      case "sparkles": return <Sparkles className="w-4 h-4" />;
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "star": return <Star className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "runware": return "text-rose-600";
      case "lovable": return "text-primary";
      case "openrouter": return "text-orange-600";
      default: return "text-muted-foreground";
    }
  };

  const selectedModelData = availableModels.find(m => m.id === selectedModel) || availableModels[0];

  return (
    <div className={`space-y-2 ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Brain className="w-4 h-4" />
          {isRTL ? "نموذج AI" : "AI Model"}
        </label>
        {selectedModel === recommendedModel && (
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            <Star className="w-3 h-3 mr-1" />
            {isRTL ? "موصى به" : "Best"}
          </Badge>
        )}
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full h-12">
          <SelectValue>
            {selectedModelData && (
              <div className="flex items-center gap-3">
                <span className={getProviderColor(selectedModelData.provider)}>
                  {getIcon(selectedModelData.icon)}
                </span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {isRTL ? selectedModelData.nameAr : selectedModelData.name}
                  </span>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model, index) => (
            <SelectItem key={model.id} value={model.id} className="py-3">
              <div className="flex items-center gap-3">
                <span className={getProviderColor(model.provider)}>
                  {getIcon(model.icon)}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {isRTL ? model.nameAr : model.name}
                    </span>
                    {index === 0 && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? model.descriptionAr : model.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
