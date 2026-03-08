"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { useWebSocket } from "./useWebSocket";

export interface Email {
    id: string;
    sender: string;
    subject: string;
    date: string;
    snippet: string;
    body?: string;
    summary?: string;
    priority: "high" | "medium" | "low";
    sentiment?: string;
    key_points?: string[];
    meeting_detected: boolean;
    requires_followup: boolean;
    followup_deadline?: string;
    ai_processed: boolean;
}

export function useEmails() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { lastMessage } = useWebSocket();

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.fetchEmails();
            setEmails(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    useEffect(() => {
        if (lastMessage?.type === "email_update") {
            setEmails(prev => {
                const index = prev.findIndex(e => e.id === lastMessage.data.id);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], ...lastMessage.data };
                    return updated;
                }
                return [lastMessage.data, ...prev];
            });
        }
    }, [lastMessage]);

    return { emails, loading, error, refresh: fetchEmails };
}
