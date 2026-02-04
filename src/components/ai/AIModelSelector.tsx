import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Brain, Image as ImageIcon, Star, Video, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type ToolType = "image" | "reels" | "ads" | "product" | "seo" | "analysis" | "ugc" | "video";

export interface AIModel {
  id: string;
  name: string;
  nameAr: string;
  provider: "lovable" | "openrouter" | "runware";
  category: "fast" | "balanced" | "pro" | "image" | "video" | "ugc";
  description: string;
  descriptionAr: string;
  bestFor: ToolType[];
  icon: "zap" | "brain" | "sparkles" | "image" | "star" | "video" | "user";
}

// All available models
export const AI_MODELS: AIModel[] = [
  // ==========================================
  // RUNWARE MODELS - Image & Video Generation
  // ==========================================
  {
    id: "runware:100@1",
    name: "Runware Flux",
    nameAr: "رانوير فلكس",
    provider: "runware",
    category: "image",
    description: "Fast & high quality image generation",
    descriptionAr: "توليد صور سريع وعالي الجودة",
    bestFor: ["image", "ugc"],
    icon: "image",
  },
  {
    id: "runware:101@1",
    name: "Runware SDXL",
    nameAr: "رانوير SDXL",
    provider: "runware",
    category: "image",
    description: "Stable Diffusion XL - detailed images",
    descriptionAr: "صور تفصيلية عالية الدقة",
    bestFor: ["image"],
    icon: "image",
  },
  {
    id: "civitai:4201@130072",
    name: "Realistic Vision",
    nameAr: "الرؤية الواقعية",
    provider: "runware",
    category: "image",
    description: "Ultra-realistic photo generation",
    descriptionAr: "توليد صور واقعية للغاية",
    bestFor: ["image", "ugc"],
    icon: "image",
  },
  {
    id: "civitai:43331@176425",
    name: "Majic Mix Realistic",
    nameAr: "ماجيك ميكس",
    provider: "runware",
    category: "image",
    description: "Best for fashion & portrait",
    descriptionAr: "الأفضل للأزياء والبورتريه",
    bestFor: ["image", "ugc"],
    icon: "image",
  },
  {
    id: "civitai:112902@447712",
    name: "epiCRealism",
    nameAr: "إبيك ريالزم",
    provider: "runware",
    category: "image",
    description: "Photorealistic with epic details",
    descriptionAr: "صور واقعية بتفاصيل مذهلة",
    bestFor: ["image"],
    icon: "star",
  },
  {
    id: "runware:video@1",
    name: "Runware Video",
    nameAr: "رانوير فيديو",
    provider: "runware",
    category: "video",
    description: "Image-to-video generation",
    descriptionAr: "تحويل الصور لفيديو",
    bestFor: ["reels", "video"],
    icon: "video",
  },

  // ==========================================
  // LOVABLE AI GATEWAY MODELS
  // ==========================================
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini Flash Lite",
    nameAr: "جيميني فلاش لايت",
    provider: "lovable",
    category: "fast",
    description: "Fastest & cheapest. Good for simple tasks",
    descriptionAr: "الأسرع والأرخص. مناسب للمهام البسيطة",
    bestFor: ["seo"],
    icon: "zap",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini Flash",
    nameAr: "جيميني فلاش",
    provider: "lovable",
    category: "balanced",
    description: "Balanced speed & quality",
    descriptionAr: "توازن بين السرعة والجودة",
    bestFor: ["ads", "reels"],
    icon: "sparkles",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    nameAr: "جيميني 3 فلاش",
    provider: "lovable",
    category: "balanced",
    description: "Latest fast model with great quality",
    descriptionAr: "أحدث نموذج سريع بجودة ممتازة",
    bestFor: ["ads", "reels", "product"],
    icon: "sparkles",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini Pro",
    nameAr: "جيميني برو",
    provider: "lovable",
    category: "pro",
    description: "Top-tier for complex reasoning",
    descriptionAr: "الأفضل للمهام المعقدة",
    bestFor: ["product", "analysis"],
    icon: "brain",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    nameAr: "جيميني 3 برو",
    provider: "lovable",
    category: "pro",
    description: "Next-gen pro model",
    descriptionAr: "الجيل الجديد من النماذج المتقدمة",
    bestFor: ["product", "analysis"],
    icon: "brain",
  },
  {
    id: "google/gemini-3-pro-image-preview",
    name: "Gemini Image Pro",
    nameAr: "جيميني صور برو",
    provider: "lovable",
    category: "image",
    description: "Best for image generation",
    descriptionAr: "الأفضل لتوليد الصور",
    bestFor: ["image"],
    icon: "image",
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    nameAr: "جي بي تي 5 نانو",
    provider: "lovable",
    category: "fast",
    description: "Fast & efficient for simple tasks",
    descriptionAr: "سريع وفعال للمهام البسيطة",
    bestFor: ["seo"],
    icon: "zap",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    nameAr: "جي بي تي 5 ميني",
    provider: "lovable",
    category: "balanced",
    description: "Good balance of performance",
    descriptionAr: "توازن جيد في الأداء",
    bestFor: ["ads", "reels"],
    icon: "sparkles",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    nameAr: "جي بي تي 5",
    provider: "lovable",
    category: "pro",
    description: "Powerful all-rounder",
    descriptionAr: "قوي ومتعدد الاستخدامات",
    bestFor: ["product", "analysis"],
    icon: "brain",
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    nameAr: "جي بي تي 5.2",
    provider: "lovable",
    category: "pro",
    description: "Latest with enhanced reasoning",
    descriptionAr: "الأحدث مع تحسينات في التفكير",
    bestFor: ["product", "analysis"],
    icon: "star",
  },

  // ==========================================
  // OPENROUTER MODELS
  // ==========================================
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    nameAr: "كلود 3.5 سونيت",
    provider: "openrouter",
    category: "pro",
    description: "Excellent for creative writing",
    descriptionAr: "ممتاز للكتابة الإبداعية",
    bestFor: ["ads", "product", "reels"],
    icon: "brain",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    nameAr: "كلود 3 هايكو",
    provider: "openrouter",
    category: "fast",
    description: "Fast & affordable Claude",
    descriptionAr: "كلود سريع وبسعر مناسب",
    bestFor: ["seo", "ads"],
    icon: "zap",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    nameAr: "لاما 3.1 70B",
    provider: "openrouter",
    category: "pro",
    description: "Open-source powerhouse",
    descriptionAr: "نموذج مفتوح المصدر قوي",
    bestFor: ["product", "analysis"],
    icon: "brain",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    nameAr: "لاما 3.1 8B",
    provider: "openrouter",
    category: "fast",
    description: "Fast open-source model",
    descriptionAr: "نموذج مفتوح المصدر سريع",
    bestFor: ["seo"],
    icon: "zap",
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    nameAr: "ميسترال لارج",
    provider: "openrouter",
    category: "pro",
    description: "European flagship model",
    descriptionAr: "النموذج الأوروبي الرائد",
    bestFor: ["product", "ads"],
    icon: "brain",
  },
  {
    id: "mistralai/mistral-small",
    name: "Mistral Small",
    nameAr: "ميسترال سمول",
    provider: "openrouter",
    category: "balanced",
    description: "Efficient European model",
    descriptionAr: "نموذج أوروبي فعال",
    bestFor: ["ads", "seo"],
    icon: "sparkles",
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5 (OR)",
    nameAr: "جيميني برو 1.5 (OR)",
    provider: "openrouter",
    category: "pro",
    description: "Gemini via OpenRouter",
    descriptionAr: "جيميني عبر OpenRouter",
    bestFor: ["product", "analysis"],
    icon: "brain",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o (OR)",
    nameAr: "جي بي تي 4o (OR)",
    provider: "openrouter",
    category: "pro",
    description: "GPT-4o via OpenRouter",
    descriptionAr: "GPT-4o عبر OpenRouter",
    bestFor: ["product", "ads", "reels"],
    icon: "brain",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini (OR)",
    nameAr: "جي بي تي 4o ميني (OR)",
    provider: "openrouter",
    category: "balanced",
    description: "Fast GPT-4o via OpenRouter",
    descriptionAr: "GPT-4o سريع عبر OpenRouter",
    bestFor: ["ads", "seo"],
    icon: "sparkles",
  },
];

// Get recommended model for a tool
export const getRecommendedModel = (toolType: ToolType): string => {
  const recommendations: Record<ToolType, string> = {
    image: "runware:100@1",
    reels: "runware:video@1",
    video: "runware:video@1",
    ugc: "civitai:43331@176425",
    ads: "google/gemini-3-flash-preview",
    product: "google/gemini-2.5-pro",
    seo: "google/gemini-2.5-flash",
    analysis: "google/gemini-2.5-pro",
  };
  return recommendations[toolType];
};

// Get models suitable for a specific tool
export const getModelsForTool = (toolType: ToolType): AIModel[] => {
  // For image generation, return image-capable models (Runware + Lovable)
  if (toolType === "image") {
    return AI_MODELS.filter(m => m.category === "image");
  }
  // For video/reels, return video models
  if (toolType === "reels" || toolType === "video") {
    return AI_MODELS.filter(m => m.category === "video" || m.category === "image");
  }
  // For UGC, return realistic image models
  if (toolType === "ugc") {
    return AI_MODELS.filter(m => m.category === "image" || m.category === "ugc");
  }
  // For text-based tools, return all non-image/video models
  return AI_MODELS.filter(m => !["image", "video", "ugc"].includes(m.category));
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

  // Group models by provider
  const runwareModels = availableModels.filter(m => m.provider === "runware");
  const lovableModels = availableModels.filter(m => m.provider === "lovable");
  const openrouterModels = availableModels.filter(m => m.provider === "openrouter");

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "zap": return <Zap className="w-3 h-3" />;
      case "brain": return <Brain className="w-3 h-3" />;
      case "sparkles": return <Sparkles className="w-3 h-3" />;
      case "image": return <ImageIcon className="w-3 h-3" />;
      case "star": return <Star className="w-3 h-3" />;
      case "video": return <Video className="w-3 h-3" />;
      case "user": return <User className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fast": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "balanced": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pro": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "image": return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      case "video": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "ugc": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      fast: { ar: "سريع", en: "Fast" },
      balanced: { ar: "متوازن", en: "Balanced" },
      pro: { ar: "متقدم", en: "Pro" },
      image: { ar: "صور", en: "Image" },
      video: { ar: "فيديو", en: "Video" },
      ugc: { ar: "UGC", en: "UGC" },
    };
    return isRTL ? labels[category]?.ar : labels[category]?.en;
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className={`space-y-2 ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Brain className="w-4 h-4" />
          {isRTL ? "نموذج الذكاء الاصطناعي" : "AI Model"}
        </Label>
        {selectedModel === recommendedModel && (
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            <Star className="w-3 h-3 mr-1" />
            {isRTL ? "موصى به" : "Recommended"}
          </Badge>
        )}
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedModelData && (
              <div className="flex items-center gap-2">
                {getIcon(selectedModelData.icon)}
                <span>{isRTL ? selectedModelData.nameAr : selectedModelData.name}</span>
                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getCategoryColor(selectedModelData.category)}`}>
                  {getCategoryLabel(selectedModelData.category)}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Runware Models (Top Priority) */}
          {runwareModels.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-rose-600">
                <Video className="w-4 h-4" />
                Runware AI
              </SelectLabel>
              {runwareModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2 py-1">
                    {getIcon(model.icon)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{isRTL ? model.nameAr : model.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getCategoryColor(model.category)}`}>
                          {getCategoryLabel(model.category)}
                        </Badge>
                        {model.id === recommendedModel && (
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
            </SelectGroup>
          )}

          {/* Lovable AI Models */}
          {lovableModels.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-primary mt-2">
                <Sparkles className="w-4 h-4" />
                Lovable AI
              </SelectLabel>
              {lovableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2 py-1">
                    {getIcon(model.icon)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{isRTL ? model.nameAr : model.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getCategoryColor(model.category)}`}>
                          {getCategoryLabel(model.category)}
                        </Badge>
                        {model.id === recommendedModel && (
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
            </SelectGroup>
          )}

          {/* OpenRouter Models */}
          {openrouterModels.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-orange-600 mt-2">
                <Zap className="w-4 h-4" />
                OpenRouter
              </SelectLabel>
              {openrouterModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2 py-1">
                    {getIcon(model.icon)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{isRTL ? model.nameAr : model.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getCategoryColor(model.category)}`}>
                          {getCategoryLabel(model.category)}
                        </Badge>
                        {model.id === recommendedModel && (
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
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {selectedModelData && (
        <p className="text-xs text-muted-foreground">
          {isRTL ? selectedModelData.descriptionAr : selectedModelData.description}
        </p>
      )}
    </div>
  );
}

// Label component for standalone use
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
