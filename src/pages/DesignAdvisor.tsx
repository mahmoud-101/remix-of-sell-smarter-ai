import { useState } from "react";
import {
  Palette,
  Sparkles,
  RotateCcw,
  Layout,
  MousePointer,
  Image,
  Type,
  AlertTriangle,
  CheckCircle,
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

const pageTypes = [
  { value: "product", label: "Product Page" },
  { value: "landing", label: "Landing Page" },
  { value: "homepage", label: "Homepage" },
  { value: "checkout", label: "Checkout Page" },
  { value: "ad", label: "Ad Creative" },
];

export default function DesignAdvisor() {
  const [pageUrl, setPageUrl] = useState("");
  const [pageType, setPageType] = useState("product");
  const [pageDescription, setPageDescription] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!pageDescription && !pageUrl) {
      toast({
        title: "Missing information",
        description: "Please provide a page URL or description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        score: 72,
        summary:
          "Your page has good fundamentals but could benefit from improved visual hierarchy and stronger CTAs.",
        categories: [
          {
            name: "Layout & Structure",
            icon: Layout,
            score: 75,
            recommendations: [
              {
                type: "improvement",
                title: "Add more white space",
                description:
                  "Increase padding between sections to improve readability and reduce visual clutter.",
              },
              {
                type: "warning",
                title: "Hero section too crowded",
                description:
                  "Consider reducing the amount of text in your hero. Focus on one clear value proposition.",
              },
              {
                type: "success",
                title: "Good mobile responsiveness",
                description: "Your layout adapts well to different screen sizes.",
              },
            ],
          },
          {
            name: "Call-to-Action",
            icon: MousePointer,
            score: 65,
            recommendations: [
              {
                type: "warning",
                title: "CTA buttons not prominent enough",
                description:
                  "Use contrasting colors and larger buttons. Consider adding urgency or value proposition to button text.",
              },
              {
                type: "improvement",
                title: "Add multiple CTAs",
                description:
                  "Place secondary CTAs throughout the page for users who scroll past the first one.",
              },
            ],
          },
          {
            name: "Visual Elements",
            icon: Image,
            score: 80,
            recommendations: [
              {
                type: "success",
                title: "High-quality product images",
                description: "Your images are crisp and professional.",
              },
              {
                type: "improvement",
                title: "Add lifestyle images",
                description:
                  "Include images showing the product in use to help customers visualize ownership.",
              },
            ],
          },
          {
            name: "Typography",
            icon: Type,
            score: 70,
            recommendations: [
              {
                type: "improvement",
                title: "Improve text hierarchy",
                description:
                  "Create clearer distinction between headings, subheadings, and body text using size and weight.",
              },
              {
                type: "warning",
                title: "Line length too long",
                description:
                  "Limit text width to 60-80 characters per line for optimal readability.",
              },
            ],
          },
        ],
        colorSuggestions: [
          { color: "#4F46E5", name: "Trust Blue", usage: "Primary CTA" },
          { color: "#F97316", name: "Action Orange", usage: "Urgency elements" },
          { color: "#10B981", name: "Success Green", usage: "Trust badges" },
        ],
        quickWins: [
          "Add social proof near CTAs (reviews count, ratings)",
          "Include trust badges (secure checkout, guarantees)",
          "Add urgency elements (limited stock, sale timer)",
          "Improve button text: 'Buy Now' → 'Get Yours Today'",
        ],
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: "Your design recommendations are ready.",
      });
    }, 2500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Design Advisor</h1>
          </div>
          <p className="text-muted-foreground">
            Get expert UX and design recommendations to improve conversions.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">Page Details</h2>

              <div className="space-y-2">
                <Label htmlFor="pageUrl">Page URL (optional)</Label>
                <Input
                  id="pageUrl"
                  placeholder="https://yourstore.com/product"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>Page Type</Label>
                <Select value={pageType} onValueChange={setPageType}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageDescription">
                  Describe Your Page/Ad *
                </Label>
                <Textarea
                  id="pageDescription"
                  placeholder="Describe your current page layout, elements, colors used, and any specific concerns..."
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  className="input-field min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessGoal">Business Goal</Label>
                <Input
                  id="businessGoal"
                  placeholder="e.g., increase add-to-cart rate, reduce bounce rate"
                  value={businessGoal}
                  onChange={(e) => setBusinessGoal(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Analyzing Design...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!analysis ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No analysis yet</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your page or provide a URL to get AI-powered design recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Score Card */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="fill-none stroke-secondary"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="fill-none stroke-primary"
                          strokeWidth="8"
                          strokeDasharray={`${(analysis.score / 100) * 251} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{analysis.score}</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg mb-1">Design Score</h2>
                      <p className="text-sm text-muted-foreground">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                {analysis.categories.map((category: any, index: number) => (
                  <div key={index} className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <category.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Score: {category.score}/100
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {category.recommendations.map((rec: any, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border ${
                            rec.type === "success"
                              ? "border-green-500/20 bg-green-500/5"
                              : rec.type === "warning"
                              ? "border-amber-500/20 bg-amber-500/5"
                              : "border-border bg-secondary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {rec.type === "success" ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            ) : rec.type === "warning" ? (
                              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-medium text-sm">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quick Wins */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Quick Wins</h2>
                  <div className="space-y-2">
                    {analysis.quickWins.map((win: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm">{win}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
