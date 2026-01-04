import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ArrowLeft,
  ArrowRight,
  Edit,
  Save,
  X,
  MessageCircle,
  DollarSign,
  History,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Fetch lead data
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Update lead mutation
  const updateLead = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      setIsEditing(false);
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم تحديث بيانات العميل بنجاح" : "Customer data updated successfully",
      });
    },
  });

  const handleEdit = () => {
    setEditData({
      customer_name: lead?.customer_name || "",
      phone: lead?.phone || "",
      address: lead?.address || "",
      order_value: lead?.order_value || "",
      notes: lead?.notes || "",
      status: lead?.status || "new",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateLead.mutate(editData);
  };

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      new: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      converted: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return styles[status || "new"];
  };

  const statusLabels: Record<string, { ar: string; en: string }> = {
    new: { ar: "جديد", en: "New" },
    contacted: { ar: "تم التواصل", en: "Contacted" },
    qualified: { ar: "مؤهل", en: "Qualified" },
    converted: { ar: "تم التحويل", en: "Converted" },
    lost: { ar: "خسارة", en: "Lost" },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isRTL ? "العميل غير موجود" : "Customer not found"}
          </p>
          <Link to="/dashboard/leads">
            <Button className="mt-4">
              {isRTL ? "العودة للعملاء" : "Back to Leads"}
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/leads">
              <Button variant="ghost" size="icon">
                {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {lead.customer_name || (isRTL ? "عميل بدون اسم" : "Unnamed Customer")}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? "ملف العميل" : "Customer Profile"}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              {isRTL ? "تعديل" : "Edit"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSave} disabled={updateLead.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {isRTL ? "حفظ" : "Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {isRTL ? "المعلومات الأساسية" : "Basic Information"}
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? "الاسم" : "Name"}</Label>
                    <Input
                      value={editData.customer_name}
                      onChange={(e) => setEditData({ ...editData, customer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "الهاتف" : "Phone"}</Label>
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "العنوان" : "Address"}</Label>
                    <Input
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "قيمة الطلب" : "Order Value"}</Label>
                    <Input
                      type="number"
                      value={editData.order_value}
                      onChange={(e) => setEditData({ ...editData, order_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? "الحالة" : "Status"}</Label>
                    <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, labels]) => (
                          <SelectItem key={value} value={value}>
                            {isRTL ? labels.ar : labels.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? "الهاتف" : "Phone"}</p>
                      <p className="font-medium">{lead.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? "العنوان" : "Address"}</p>
                      <p className="font-medium">{lead.address || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? "قيمة الطلب" : "Order Value"}</p>
                      <p className="font-medium">${lead.order_value || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {isRTL ? "الملاحظات" : "Notes"}
              </h2>
              {isEditing ? (
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">
                  {lead.notes || (isRTL ? "لا توجد ملاحظات" : "No notes")}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">{isRTL ? "الحالة" : "Status"}</h2>
              <Badge className={`${getStatusBadge(lead.status)} text-sm px-3 py-1`}>
                {statusLabels[lead.status || "new"]?.[isRTL ? "ar" : "en"]}
              </Badge>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">{isRTL ? "التواريخ" : "Dates"}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{isRTL ? "تاريخ الإنشاء:" : "Created:"}</span>
                  <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{isRTL ? "آخر تحديث:" : "Updated:"}</span>
                  <span>{new Date(lead.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">{isRTL ? "إجراءات سريعة" : "Quick Actions"}</h2>
              <div className="space-y-2">
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                      {isRTL ? "واتساب" : "WhatsApp"}
                    </Button>
                  </a>
                )}
                {lead.phone && (
                  <a href={`tel:${lead.phone}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2 text-blue-500" />
                      {isRTL ? "اتصال" : "Call"}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
