import { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  RotateCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly & Casual" },
  { value: "luxury", label: "Luxury & Premium" },
  { value: "aggressive", label: "Urgent & Aggressive" },
  { value: "playful", label: "Playful & Fun" },
];

const outputTypes = [
  { id: "title", label: "Product Title", icon: "🏷️" },
  { id: "description", label: "Description", icon: "📝" },
  { id: "bullets", label: "Bullet Points", icon: "✅" },
  { id: "benefits", label: "Key Benefits", icon: "⭐" },
  { id: "cta", label: "Call to Action", icon: "🎯" },
];

export default function ProductCopy() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    "title",
    "description",
    "bullets",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const toggleOutput = (id: string) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!productName || !productDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in the product name and description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation - replace with actual AI call
    setTimeout(() => {
      const mockContent: Record<string, string> = {
        title: `${productName} - Premium Quality Solution for ${targetAudience || "Everyone"}`,
        description: `Discover the revolutionary ${productName} that transforms how you ${productDescription.slice(0, 50)}... Crafted with precision and designed for excellence, this product delivers exceptional value and performance that exceeds expectations.`,
        bullets: `• Premium quality materials for lasting durability
• Designed with user comfort and convenience in mind
• Perfect for ${targetAudience || "everyday use"}
• Easy to use with intuitive features
• Backed by our satisfaction guarantee`,
        benefits: `✨ Save time and effort with streamlined functionality
✨ Experience superior quality that lasts
✨ Join thousands of satisfied customers
✨ Invest in a solution that truly delivers`,
        cta: `🛒 Get Your ${productName} Today - Limited Stock Available!\n\n💫 Order now and experience the difference. Free shipping on orders over $50!`,
      };

      const filtered: Record<string, string> = {};
      selectedOutputs.forEach((key) => {
        if (mockContent[key]) {
          filtered[key] = mockContent[key];
        }
      });

      setGeneratedContent(filtered);
      setIsGenerating(false);
      toast({
        title: "Content generated!",
        description: "Your product copy is ready to use.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Product Copy Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate compelling product copy that converts browsers into buyers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                  1
                </span>
                Product Details
              </h2>

              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Wireless Bluetooth Headphones"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">
                  Product Description *
                </Label>
                <Textarea
                  id="productDescription"
                  placeholder="Describe your product features, what it does, and what makes it special..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="input-field min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., fitness enthusiasts, busy professionals"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>Tone of Voice</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                  2
                </span>
                Output Types
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {outputTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleOutput(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedOutputs.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                      {selectedOutputs.includes(type.id) && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Copy
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h2 className="font-semibold">Generated Content</h2>

            {Object.keys(generatedContent).length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No content yet</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your product details and click generate to create
                  AI-powered copy.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(generatedContent).map(([key, content]) => {
                  const outputType = outputTypes.find((t) => t.id === key);
                  return (
                    <div
                      key={key}
                      className="glass-card rounded-xl p-5 space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{outputType?.icon}</span>
                          <h3 className="font-medium">{outputType?.label}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
