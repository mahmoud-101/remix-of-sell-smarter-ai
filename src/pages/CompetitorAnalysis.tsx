import { useState } from "react";
import {
  Target,
  Sparkles,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function CompetitorAnalysis() {
  const [competitorName, setCompetitorName] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorDescription, setCompetitorDescription] = useState("");
  const [yourBusiness, setYourBusiness] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!competitorName && !competitorUrl && !competitorDescription) {
      toast({
        title: "Missing information",
        description: "Please provide competitor name, URL, or description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        competitor: competitorName || "Competitor",
        overview:
          "Based on the information provided, this competitor has a strong market presence with focus on premium positioning and customer experience.",
        strengths: [
          {
            title: "Strong Brand Recognition",
            description:
              "Well-established brand with consistent visual identity and messaging across channels.",
          },
          {
            title: "Premium Product Quality",
            description:
              "High-quality products with attention to detail, justifying premium pricing.",
          },
          {
            title: "Excellent Customer Service",
            description:
              "Fast response times and generous return policy build customer trust.",
          },
          {
            title: "Active Social Presence",
            description:
              "Regular content with high engagement rates on Instagram and TikTok.",
          },
        ],
        weaknesses: [
          {
            title: "Limited Product Range",
            description:
              "Focuses on narrow niche, missing opportunities in adjacent categories.",
          },
          {
            title: "High Price Point",
            description:
              "Premium pricing may exclude budget-conscious customers.",
          },
          {
            title: "Slow Website",
            description:
              "Page load times above average may hurt mobile conversions.",
          },
        ],
        pricing: {
          strategy: "Premium/Value-Based",
          range: "$49 - $199",
          tactics: [
            "Free shipping over $75",
            "Occasional 20% sales",
            "Bundle discounts",
          ],
        },
        messaging: {
          tone: "Premium, aspirational, lifestyle-focused",
          keywords: [
            "Premium quality",
            "Sustainable",
            "Modern design",
            "Handcrafted",
          ],
          uniqueValue:
            "Emphasizes sustainability and artisanal craftsmanship to justify premium pricing.",
        },
        opportunities: [
          {
            title: "Target Price-Sensitive Segment",
            description:
              "Offer a value line to capture customers priced out by competitor.",
            impact: "High",
          },
          {
            title: "Faster Delivery",
            description:
              "Competitor offers standard 5-7 day shipping. Offer express options.",
            impact: "Medium",
          },
          {
            title: "Expand Product Categories",
            description:
              "Enter adjacent categories they've neglected to capture more market share.",
            impact: "High",
          },
          {
            title: "Better Mobile Experience",
            description:
              "Create a superior mobile shopping experience with faster load times.",
            impact: "Medium",
          },
        ],
        actionPlan: [
          "Develop a competitive pricing strategy with clear value proposition",
          "Create content highlighting your unique differentiators",
          "Target their weak points in your marketing messaging",
          "Monitor their promotions and campaigns closely",
        ],
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: "Your competitor analysis is ready.",
      });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Competitor Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Analyze competitors to find opportunities and outperform them.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">Competitor Details</h2>

              <div className="space-y-2">
                <Label htmlFor="competitorName">Competitor Name</Label>
                <Input
                  id="competitorName"
                  placeholder="e.g., Brand X"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitorUrl">Website URL</Label>
                <Input
                  id="competitorUrl"
                  placeholder="https://competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitorDescription">
                  What do you know about them?
                </Label>
                <Textarea
                  id="competitorDescription"
                  placeholder="Products they sell, their marketing approach, pricing, target audience..."
                  value={competitorDescription}
                  onChange={(e) => setCompetitorDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yourBusiness">Your Business (optional)</Label>
                <Textarea
                  id="yourBusiness"
                  placeholder="Describe your business to get more relevant comparisons..."
                  value={yourBusiness}
                  onChange={(e) => setYourBusiness(e.target.value)}
                  className="input-field min-h-[80px]"
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
                  Analyzing Competitor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Competitor
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!analysis ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No analysis yet</h3>
                <p className="text-sm text-muted-foreground">
                  Provide competitor details to get a comprehensive analysis and actionable insights.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Overview */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold text-lg mb-2">
                    Analysis: {analysis.competitor}
                  </h2>
                  <p className="text-muted-foreground">{analysis.overview}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.strengths.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                        >
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold">Weaknesses</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.weaknesses.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                        >
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Messaging */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Pricing Strategy</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Strategy
                        </span>
                        <span className="font-medium text-sm">
                          {analysis.pricing.strategy}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Price Range
                        </span>
                        <span className="font-medium text-sm">
                          {analysis.pricing.range}
                        </span>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Tactics
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.pricing.tactics.map(
                            (tactic: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-secondary rounded-md text-xs"
                              >
                                {tactic}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Messaging Style</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tone</p>
                        <p className="text-sm">{analysis.messaging.tone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Keywords
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.messaging.keywords.map(
                            (keyword: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                              >
                                {keyword}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opportunities */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Opportunities to Outperform</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.opportunities.map((opp: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-accent/20 bg-accent/5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{opp.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              opp.impact === "High"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {opp.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {opp.description}
                        </p>
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
