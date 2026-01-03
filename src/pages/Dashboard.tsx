import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  Calendar,
  Palette,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

const tools = [
  {
    icon: FileText,
    title: "Product Copy Generator",
    description: "Create compelling product descriptions and titles",
    path: "/dashboard/product-copy",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Megaphone,
    title: "Ads Copy Generator",
    description: "Generate high-converting ad copy for all platforms",
    path: "/dashboard/ads-copy",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Calendar,
    title: "Campaign Planner",
    description: "Plan complete marketing campaigns with AI",
    path: "/dashboard/campaign",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Palette,
    title: "Design Advisor",
    description: "Get UX and design recommendations",
    path: "/dashboard/design",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Target,
    title: "Competitor Analysis",
    description: "Analyze competitors and find opportunities",
    path: "/dashboard/competitor",
    color: "from-violet-500 to-purple-500",
  },
];

const stats = [
  { label: "Content Generated", value: "0", icon: FileText },
  { label: "Campaigns Created", value: "0", icon: Calendar },
  { label: "Time Saved", value: "0h", icon: Clock },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Welcome to SellGenius
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Ready to supercharge your sales?
              </h1>
              <p className="text-muted-foreground">
                Choose a tool below to get started with AI-powered content
                generation.
              </p>
            </div>
            <Link to="/dashboard/product-copy">
              <Button variant="hero" className="group">
                Generate Content
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tools Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">AI Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => (
              <Link
                key={index}
                to={tool.path}
                className="feature-card group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Quick Tips</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <h3 className="font-medium mb-1">Be Specific</h3>
              <p className="text-sm text-muted-foreground">
                The more details you provide about your product and target
                audience, the better the AI-generated content will be.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <h3 className="font-medium mb-1">Iterate & Refine</h3>
              <p className="text-sm text-muted-foreground">
                Generate multiple variations and combine the best elements to
                create the perfect copy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
