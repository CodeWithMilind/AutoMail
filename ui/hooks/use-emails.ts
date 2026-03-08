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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTokens, setPageTokens] = useState<Record<number, string | null>>({ 1: null });
  const [hasNextPage, setHasNextPage] = useState(false);

  // Selection/Detail state
  const [selectedEmailDetail, setSelectedEmailDetail] = useState<Email | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const transformEmailMetadata = useCallback((data: any): Email => {
    return {
      id: data.id,
      sender: data.sender.split("<")[0].trim(),
      senderEmail: data.sender.match(/<(.+)>/)?.[1] || data.sender,
      subject: data.subject,
      snippet: data.snippet,
      date: data.date,
      aiSummary: data.snippet,
      tasksExtracted: 0,
      tasks: [],
      isRead: true,
      priority: "medium",
      fullContent: data.snippet,
    };
  }, []);

  const fetchEmailMetadata = async (id: string) => {
    try {
      const res = await fetch("/api/gmail/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: id, mode: "metadata" }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    setEmails([]); // Clear current emails for progressive load

    try {
      const token = pageTokens[page];
      const url = token 
        ? `/api/gmail/emails?idsOnly=true&pageToken=${token}`
        : `/api/gmail/emails?idsOnly=true`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to fetch Gmail inbox.");
      
      const { messages, nextPageToken } = await response.json();
      
      // Store token for next page
      if (nextPageToken) {
        setPageTokens(prev => ({ ...prev, [page + 1]: nextPageToken }));
        setHasNextPage(true);
      } else {
        setHasNextPage(false);
      }

      // Progressive loading: fetch metadata for each ID one by one
      for (const msg of messages) {
        const metadata = await fetchEmailMetadata(msg.id);
        if (metadata) {
          const transformed = transformEmailMetadata(metadata);
          setEmails(prev => {
            // Prevent duplicates in state
            const exists = prev.some(e => e.id === transformed.id);
            if (exists) return prev;
            return [...prev, transformed];
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageTokens, transformEmailMetadata]);

  useEffect(() => {
    loadPage(1);
  }, []);

  const nextPage = () => {
    if (hasNextPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      loadPage(newPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      loadPage(newPage);
    }
  };

  const fetchEmailDetail = useCallback(async (emailId: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch("/api/gmail/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch email details");
      const data = await response.json();
      
      const detailedEmail: Email = {
        id: data.id,
        sender: data.sender.split("<")[0].trim(),
        senderEmail: data.sender.match(/<(.+)>/)?.[1] || data.sender,
        subject: data.subject,
        snippet: data.body.substring(0, 100),
        date: data.date,
        aiSummary: data.ai_summary,
        tasksExtracted: data.tasks.length,
        tasks: data.tasks,
        isRead: true,
        priority: data.priority,
        fullContent: data.body,
      };
      
      setSelectedEmailDetail(detailedEmail);
      setEmails(prev => prev.map(e => e.id === emailId ? detailedEmail : e));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  return { 
    emails, 
    loading, 
    error, 
    currentPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage: currentPage > 1,
    fetchEmailDetail,
    selectedEmailDetail,
    setSelectedEmailDetail,
    loadingDetail
  };
}
