"use client";

import { useState, useEffect, useCallback } from "react";
import { api, Email } from "@/services/api";

export function useEmails() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.fetchEmails();
            setEmails(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch emails");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    return { emails, loading, error, refresh: fetchEmails };
}
