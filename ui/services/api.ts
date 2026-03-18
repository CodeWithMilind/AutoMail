import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const EMAIL_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://codewithmilind.app.n8n.cloud/webhook/emails";
const BASE_URL = EMAIL_WEBHOOK_URL.replace('/emails', '');
const FETCH_TIMEOUT = 15000; // 15 seconds

export interface Email {
  id: string;
  subject: string;
  sender: string;
  summary: string;
  priority: "High" | "Medium" | "Low";
  cta?: string;
  timestamp?: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed" | "In Progress";
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

export interface Insight {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  timestamp: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response [${response.status}]:`, errorText);
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Success [${url}]:`, data);
    return data;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`API Timeout [${url}]`);
      throw new Error("Request timed out. Please ensure n8n workflow is active.");
    }
    console.error(`API Fetch Error [${url}]:`, error.message);
    throw error;
  }
}

// API Functions
export const fetchEmails = async (): Promise<Email[]> => {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || `${BASE_URL}/emails`;
  const data = await fetchWithTimeout(url);
  console.log("API response (emails):", data);
  // Ensure we handle both { emails: [] } and raw array [] formats
  return Array.isArray(data) ? data : (data.emails || []);
};

export const fetchTasks = async (): Promise<Task[]> => {
  const data = await fetchWithTimeout(`${BASE_URL}/tasks`);
  console.log("API response (tasks):", data);
  return Array.isArray(data) ? data : (data.tasks || []);
};

export const fetchMeetings = async (): Promise<Meeting[]> => {
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/meetings`);
    console.log("API response (meetings):", data);
    return Array.isArray(data) ? data : (data.meetings || []);
  } catch (error) {
    console.error("Meetings fetch failed, using fallback:", error);
    return [];
  }
};

export const fetchInsights = async (): Promise<Insight[]> => {
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/insights`);
    console.log("API response (insights):", data);
    return Array.isArray(data) ? data : (data.insights || []);
  } catch (error) {
    console.error("Insights fetch failed, using fallback:", error);
    return [];
  }
};

export const processEmails = async () => {
  const data = await fetchWithTimeout(`${BASE_URL}/process-emails`, { method: "POST" });
  console.log("Sync response:", data);
  return data;
};

// React Query Hooks
export function useEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: fetchEmails,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: fetchMeetings,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });
}

export function useSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processEmails,
    onSuccess: () => {
      toast.success("Sync complete! Data updated.");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: (error: any) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}

// Backward compatibility object
export const api = {
  fetchEmails,
  fetchTasks,
  fetchMeetings,
  fetchInsights,
  triggerEmailProcessing: processEmails,
};
