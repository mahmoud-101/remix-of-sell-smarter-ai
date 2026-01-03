import { useState } from "react";
import {
  History as HistoryIcon,
  FileText,
  Megaphone,
  Calendar,
  Palette,
  Target,
  Search,
  Filter,
  Clock,
  ChevronRight,
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

const mockHistory = [
  {
    id: 1,
    type: "product",
    icon: FileText,
    title: "Wireless Bluetooth Headphones",
    preview: "Premium wireless headphones with active noise cancellation...",
    date: "2024-01-15",
    time: "2:34 PM",
  },
  {
    id: 2,
    type: "ads",
    icon: Megaphone,
    title: "Facebook Ad Campaign - Winter Sale",
    preview: "🔥 Limited Time Offer! Get 30% off all products...",
    date: "2024-01-14",
    time: "11:20 AM",
  },
  {
    id: 3,
    type: "campaign",
    icon: Calendar,
    title: "Q1 Marketing Campaign Plan",
    preview: "3-month campaign focusing on brand awareness and conversions...",
    date: "2024-01-13",
    time: "4:15 PM",
  },
  {
    id: 4,
    type: "design",
    icon: Palette,
    title: "Product Page Analysis",
    preview: "Score: 72/100 - Recommendations for improving conversions...",
    date: "2024-01-12",
    time: "9:45 AM",
  },
  {
    id: 5,
    type: "competitor",
    icon: Target,
    title: "Competitor: Brand X Analysis",
    preview: "Strengths, weaknesses, and opportunities identified...",
    date: "2024-01-11",
    time: "3:00 PM",
  },
];

const typeColors: Record<string, string> = {
  product: "from-blue-500 to-indigo-500",
  ads: "from-pink-500 to-rose-500",
  campaign: "from-amber-500 to-orange-500",
  design: "from-emerald-500 to-teal-500",
  competitor: "from-violet-500 to-purple-500",
};

const typeLabels: Record<string, string> = {
  product: "Product Copy",
  ads: "Ads Copy",
  campaign: "Campaign",
  design: "Design",
  competitor: "Competitor",
};

export default function History() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.preview.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold">History</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage your previously generated content.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px] input-field">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Product Copy</SelectItem>
              <SelectItem value="ads">Ads Copy</SelectItem>
              <SelectItem value="campaign">Campaigns</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="competitor">Competitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No history found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Your generated content will appear here."}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-5 hover-lift cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                      typeColors[item.type]
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {typeLabels[item.type]}
                      </span>
                    </div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {item.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.date} at {item.time}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
