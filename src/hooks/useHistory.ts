import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

interface HistoryItem {
  id: string;
  tool_type: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  created_at: string;
}

function parseJsonField(field: Json): Record<string, any> {
  if (typeof field === "object" && field !== null && !Array.isArray(field)) {
    return field as Record<string, any>;
  }
  return {};
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const parsed: HistoryItem[] = (data || []).map((item) => ({
        id: item.id,
        tool_type: item.tool_type,
        input_data: parseJsonField(item.input_data),
        output_data: parseJsonField(item.output_data),
        created_at: item.created_at,
      }));
      
      setHistory(parsed);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (
    toolType: string,
    inputData: Record<string, any>,
    outputData: Record<string, any>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("history")
        .insert({
          user_id: user.id,
          tool_type: toolType,
          input_data: inputData as Json,
          output_data: outputData as Json,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newItem: HistoryItem = {
        id: data.id,
        tool_type: data.tool_type,
        input_data: parseJsonField(data.input_data),
        output_data: parseJsonField(data.output_data),
        created_at: data.created_at,
      };
      
      setHistory((prev) => [newItem, ...prev]);
      return newItem;
    } catch (error) {
      console.error("Error saving to history:", error);
      return null;
    }
  };

  const deleteFromHistory = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting from history:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return { history, loading, saveToHistory, deleteFromHistory, refetch: fetchHistory };
}
