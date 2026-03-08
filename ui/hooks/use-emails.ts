"use client";

import { useState, useEffect, useCallback } from "react";

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  date: string;
  aiSummary: string;
  tasksExtracted: number;
  tasks: string[];
  isRead: boolean;
  priority: "high" | "medium" | "low";
  fullContent: string;
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const transformEmails = useCallback((data: any[]): Email[] => {
    return data.map((email: any) => ({
      id: email.id,
      sender: email.sender.split("<")[0].trim(),
      senderEmail: email.sender.match(/<(.+)>/)?.[1] || email.sender,
      subject: email.subject,
      snippet: email.snippet,
      date: email.date,
      aiSummary: email.snippet, // Using snippet as AI Summary for now
      tasksExtracted: 0,
      tasks: [],
      isRead: true,
      priority: "medium",
      fullContent: email.snippet,
    }));
  }, []);

  const fetchEmails = useCallback(async (pageToken?: string) => {
    if (pageToken) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = pageToken 
        ? `/api/gmail/emails?pageToken=${pageToken}`
        : "/api/gmail/emails";
        
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to fetch Gmail inbox.");
      }
      
      const { emails: newEmails, nextPageToken: newToken } = await response.json();
      const transformed = transformEmails(newEmails);

      if (pageToken) {
        setEmails((prev) => [...prev, ...transformed]);
      } else {
        setEmails(transformed);
      }
      setNextPageToken(newToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [transformEmails]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const loadMore = useCallback(() => {
    if (nextPageToken && !loadingMore) {
      fetchEmails(nextPageToken);
    }
  }, [nextPageToken, loadingMore, fetchEmails]);

  return { 
    emails, 
    loading, 
    loadingMore, 
    error, 
    loadMore, 
    hasMore: !!nextPageToken 
  };
}
