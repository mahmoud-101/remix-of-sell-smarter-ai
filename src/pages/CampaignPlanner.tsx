import { useState } from "react";
import {
  Calendar,
  Sparkles,
  RotateCcw,
  Target,
  DollarSign,
  Clock,
  ChevronRight,
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

const budgetRanges = [
  { value: "500", label: "$500 - $1,000" },
  { value: "2000", label: "$2,000 - $5,000" },
  { value: "5000", label: "$5,000 - $10,000" },
  { value: "10000", label: "$10,000+" },
];

const durations = [
  { value: "1", label: "1 Week" },
  { value: "2", label: "2 Weeks" },
  { value: "4", label: "1 Month" },
  { value: "8", label: "2 Months" },
  { value: "12", label: "3 Months" },
];

export default function CampaignPlanner() {
  const [campaignGoal, setCampaignGoal] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [budget, setBudget] = useState("2000");
  const [duration, setDuration] = useState("4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignPlan, setCampaignPlan] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!campaignGoal || !productDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in your campaign goal and product details.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockPlan = {
        overview: {
          goal: campaignGoal,
          duration: durations.find((d) => d.value === duration)?.label,
          budget: budgetRanges.find((b) => b.value === budget)?.label,
        },
        funnel: [
          {
            stage: "Awareness",
            percentage: "40%",
            budget: "$800 - $2,000",
            tactics: [
              "Video ads on Facebook/Instagram",
              "TikTok organic content",
              "Influencer partnerships",
            ],
            content: [
              "Educational content about the problem",
              "Behind-the-scenes content",
              "User testimonials compilation",
            ],
          },
          {
            stage: "Consideration",
            percentage: "35%",
            budget: "$700 - $1,750",
            tactics: [
              "Retargeting ads",
              "Email nurture sequence",
              "Product demo videos",
            ],
            content: [
              "Product comparison guides",
              "Case studies",
              "FAQ content",
            ],
          },
          {
            stage: "Conversion",
            percentage: "25%",
            budget: "$500 - $1,250",
            tactics: [
              "Limited-time offers",
              "Abandoned cart emails",
              "Direct response ads",
            ],
            content: [
              "Urgency-driven copy",
              "Discount codes",
              "Social proof highlights",
            ],
          },
        ],
        schedule: [
          {
            week: "Week 1-2",
            focus: "Launch & Awareness",
            tasks: [
              "Launch awareness campaigns on all platforms",
              "Begin influencer outreach",
              "A/B test ad creatives",
            ],
          },
          {
            week: "Week 3-4",
            focus: "Optimization & Retargeting",
            tasks: [
              "Analyze initial results",
              "Scale winning ad sets",
              "Launch retargeting campaigns",
            ],
          },
        ],
        kpis: [
          { metric: "Reach", target: "50,000 - 100,000" },
          { metric: "Engagement Rate", target: "3-5%" },
          { metric: "CTR", target: "1.5-2.5%" },
          { metric: "ROAS", target: "3x - 5x" },
        ],
      };

      setCampaignPlan(mockPlan);
      setIsGenerating(false);
      toast({
        title: "Campaign plan generated!",
        description: "Your comprehensive marketing plan is ready.",
      });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Campaign Planner</h1>
          </div>
          <p className="text-muted-foreground">
            Create comprehensive marketing campaigns with AI-powered strategy and scheduling.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold">Campaign Details</h2>

              <div className="space-y-2">
                <Label htmlFor="campaignGoal">Campaign Goal *</Label>
                <Input
                  id="campaignGoal"
                  placeholder="e.g., Launch new product, increase sales by 30%"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Product / Service *</Label>
                <Textarea
                  id="productDescription"
                  placeholder="What are you marketing? Key features and value proposition..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Small business owners, 30-50 years old"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Range</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  Planning Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Campaign Plan
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-3 space-y-6">
            {!campaignPlan ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No campaign plan yet</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your campaign details to generate a comprehensive marketing plan.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Overview */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Campaign Overview</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <Target className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">Goal</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.goal}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <Clock className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.duration}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <DollarSign className="w-5 h-5 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-medium text-sm">{campaignPlan.overview.budget}</p>
                    </div>
                  </div>
                </div>

                {/* Funnel Strategy */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Funnel Strategy</h2>
                  <div className="space-y-4">
                    {campaignPlan.funnel.map((stage: any, index: number) => (
                      <div key={index} className="p-4 rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{stage.stage}</h3>
                              <p className="text-xs text-muted-foreground">
                                {stage.percentage} of budget • {stage.budget}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Tactics</p>
                            <ul className="space-y-1">
                              {stage.tactics.map((tactic: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <ChevronRight className="w-3 h-3 text-primary" />
                                  {tactic}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Content Ideas</p>
                            <ul className="space-y-1">
                              {stage.content.map((content: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <ChevronRight className="w-3 h-3 text-accent" />
                                  {content}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPIs */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Target KPIs</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {campaignPlan.kpis.map((kpi: any, index: number) => (
                      <div key={index} className="p-4 rounded-xl bg-secondary/50 text-center">
                        <p className="text-xs text-muted-foreground mb-1">{kpi.metric}</p>
                        <p className="font-semibold text-primary">{kpi.target}</p>
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
