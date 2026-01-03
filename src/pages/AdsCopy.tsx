import { useState } from "react";
import {
  Megaphone,
  Sparkles,
  Copy,
  RotateCcw,
  Facebook,
  Instagram,
  Youtube,
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

const platforms = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "google", label: "Google Ads", icon: Youtube, color: "from-red-500 to-red-600" },
  { id: "tiktok", label: "TikTok", icon: Megaphone, color: "from-gray-900 to-gray-800" },
];

const campaignGoals = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "traffic", label: "Website Traffic" },
  { value: "engagement", label: "Engagement" },
  { value: "conversions", label: "Conversions / Sales" },
  { value: "leads", label: "Lead Generation" },
];

export default function AdsCopy() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [campaignGoal, setCampaignGoal] = useState("conversions");
  const [variations, setVariations] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<any[]>([]);
  const { toast } = useToast();

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!productName || !productDescription || selectedPlatforms.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockAds = selectedPlatforms.flatMap((platform) => {
        const platformData = platforms.find((p) => p.id === platform);
        return Array.from({ length: parseInt(variations) }, (_, i) => ({
          id: `${platform}-${i + 1}`,
          platform: platformData?.label,
          platformId: platform,
          variation: `Variation ${String.fromCharCode(65 + i)}`,
          headline: `${i === 0 ? "🔥 " : i === 1 ? "✨ " : "💫 "}${productName} - ${
            i === 0
              ? "Limited Time Offer!"
              : i === 1
              ? "Transform Your Life Today"
              : "Exclusive Deal Inside"
          }`,
          primaryText: `${
            i === 0
              ? `Are you ready to experience the best ${productName.toLowerCase()} on the market?`
              : i === 1
              ? `Thousands of happy customers can't be wrong!`
              : `Your search for the perfect solution ends here.`
          }\n\n${productDescription.slice(0, 100)}...\n\n${
            i === 0
              ? "🎁 Use code SAVE20 for 20% off your first order!"
              : i === 1
              ? "⭐ Join 10,000+ satisfied customers today!"
              : "🚀 Free shipping on all orders over $50!"
          }`,
          cta: i === 0 ? "Shop Now" : i === 1 ? "Learn More" : "Get Started",
          hook: `${
            i === 0
              ? "Stop scrolling! This is the game-changer you've been waiting for 👇"
              : i === 1
              ? "POV: You just found the secret to [desired outcome] 🤫"
              : "Wait... is this actually real? 😱"
          }`,
        }));
      });

      setGeneratedAds(mockAds);
      setIsGenerating(false);
      toast({
        title: "Ads generated!",
        description: `Created ${mockAds.length} ad variations across ${selectedPlatforms.length} platform(s).`,
      });
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Ad copy copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Ads Copy Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Create high-converting ad copy for Facebook, Instagram, Google, and TikTok.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">Campaign Details</h2>

              <div className="space-y-2">
                <Label htmlFor="productName">Product / Service Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Fitness App Pro"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Description *</Label>
                <Textarea
                  id="productDescription"
                  placeholder="What are you promoting? Key features and benefits..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Women 25-45, fitness enthusiasts"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Goal</Label>
                <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignGoals.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Variations per Platform</Label>
                <Select value={variations} onValueChange={setVariations}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 variation</SelectItem>
                    <SelectItem value="2">2 variations</SelectItem>
                    <SelectItem value="3">3 variations (A/B/C)</SelectItem>
                    <SelectItem value="5">5 variations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Select Platforms *</h2>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPlatforms.includes(platform.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                      >
                        <platform.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{platform.label}</span>
                      {selectedPlatforms.includes(platform.id) && (
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
                  Generating Ads...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Ad Copy
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold">Generated Ads</h2>

            {generatedAds.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No ads generated yet</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your campaign details and select platforms to generate
                  high-converting ad copy.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {generatedAds.map((ad) => {
                  const platformData = platforms.find((p) => p.id === ad.platformId);
                  return (
                    <div
                      key={ad.id}
                      className="glass-card rounded-xl p-5 space-y-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platformData?.color} flex items-center justify-center`}
                          >
                            {platformData && (
                              <platformData.icon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{ad.platform}</h3>
                            <p className="text-xs text-muted-foreground">
                              {ad.variation}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${ad.headline}\n\n${ad.primaryText}\n\nCTA: ${ad.cta}`
                            )
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Headline
                          </p>
                          <p className="font-medium">{ad.headline}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Primary Text
                          </p>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {ad.primaryText}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              CTA Button
                            </p>
                            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md">
                              {ad.cta}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Hook (for video/reels)
                          </p>
                          <p className="text-muted-foreground italic">{ad.hook}</p>
                        </div>
                      </div>
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
