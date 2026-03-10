"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Loader2, User, Calendar, Tag, Sparkles, CheckSquare, RefreshCw, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Email } from "@/hooks/useEmails"

interface EmailDetailProps {
  email: Email
  onClose: () => void
}

interface FullEmailDetail {
  id: string
  sender: string
  subject: string
  date: string
  body: string
  ai_summary?: string
  sentiment?: string
  key_points?: string[]
  tasks?: { title: string; priority: string; description?: string; due_date?: string }[]
  priority?: string
  is_meeting_related?: boolean
  requires_followup?: boolean
}

const priorityColors: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-success/15 text-success border-success/30",
}

const sentimentColors: Record<string, string> = {
  positive: "text-success",
  neutral: "text-muted-foreground",
  negative: "text-destructive",
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  const [detail, setDetail] = useState<FullEmailDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  const fetchDetail = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch("/api/gmail/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email.id, mode: "full" }),
      })
      if (res.ok) {
        const data = await res.json()
        setDetail(data)
        // If AI analysis is now available, stop polling
        if (data.ai_summary) setPolling(false)
        else if (!silent) setPolling(true) // Start polling if analysis is missing on first load
      } else {
        throw new Error("fetch failed")
      }
    } catch {
      // Fallback to data we already have from list
      setDetail({
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        date: email.date,
        body: email.snippet || "Full email body unavailable.",
        ai_summary: email.summary,
        priority: email.priority,
        sentiment: email.sentiment,
        key_points: email.key_points,
      })
    } finally {
      if (!silent) setLoading(false)
    }
  }, [email])

  // Initial fetch
  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Poll every 6 seconds if AI analysis not yet available
  useEffect(() => {
    if (!detail || detail.ai_summary || !polling) return
    
    const interval = setInterval(() => {
      fetchDetail(true) // silent = no loading spinner
    }, 6000)

    // Stop after 60 seconds max
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setPolling(false)
    }, 60000)

    return () => { 
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [detail?.ai_summary, polling, fetchDetail])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose() 
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-muted/10">
        <div className="flex flex-col min-w-0 mr-4">
          <h2 className="text-lg font-bold text-foreground truncate">
            {detail?.subject || email.subject}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{detail?.sender || email.sender}</span>
            <span>•</span>
            <span>{detail?.date || email.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs font-semibold rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}`, "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Gmail
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Modal Body */}
      {loading && !detail ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Fetching full email content...
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-8 p-8 max-w-4xl mx-auto">
            
            {/* Badges Section */}
            <div className="flex flex-wrap items-center gap-3">
              {detail?.priority && (
                <Badge variant="outline" className={cn("capitalize text-xs font-semibold px-2.5 py-0.5", priorityColors[detail.priority])}>
                  {detail.priority} priority
                </Badge>
              )}
              {detail?.is_meeting_related && (
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 text-primary border-primary/30 bg-primary/10">
                  📅 Meeting
                </Badge>
              )}
              {detail?.requires_followup && (
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 text-warning border-warning/30 bg-warning/10">
                  ↩ Follow-up needed
                </Badge>
              )}
            </div>

            {/* Email Body */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Email Content
              </h3>
              <div className="rounded-2xl border border-border bg-muted/20 p-6 shadow-inner">
                <pre className="whitespace-pre-wrap font-sans text-base text-foreground leading-relaxed">
                  {detail?.body}
                </pre>
              </div>
            </div>

            {/* AI Analysis Section */}
            <Separator className="bg-border/60" />
            
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Executive Insights
              </h3>

              {detail?.ai_summary ? (
                <div className="grid gap-6">
                  {/* Summary */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Summary</p>
                    <p className="text-base text-foreground leading-relaxed font-medium">
                      {detail.ai_summary}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Sentiment */}
                    <div className="rounded-2xl border border-border bg-muted/20 p-6">
                      <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Sentiment</p>
                      <p className={cn("text-lg font-bold capitalize", sentimentColors[detail.sentiment] || "text-foreground")}>
                        {detail.sentiment}
                      </p>
                    </div>

                    {/* Key Points */}
                    {detail?.key_points && detail.key_points.length > 0 && (
                      <div className="rounded-2xl border border-border bg-muted/20 p-6">
                        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Key Takeaways</p>
                        <ul className="space-y-2.5">
                          {detail.key_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-snug">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-10 text-center">
                  <div className="flex flex-col items-center gap-4">
                    {polling ? (
                      <>
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">Analyzing with AI...</p>
                          <p className="text-xs text-muted-foreground">This usually takes 5-10 seconds</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">AI analysis not yet available for this email</p>
                        <Button variant="outline" size="sm" className="gap-2 mt-2 rounded-full" onClick={() => fetchDetail()}>
                          <RefreshCw className="h-3 w-3" /> Retry Analysis
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Tasks Section */}
            <Separator className="bg-border/60" />
            <div className="space-y-5 pb-8">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                <CheckSquare className="h-4 w-4 text-success" />
                Extracted Tasks {detail?.tasks && detail.tasks.length > 0 && `(${detail.tasks.length})`}
              </h3>
              
              {detail?.tasks && detail.tasks.length > 0 ? (
                <>
                  <div className="grid gap-4">
                    {detail.tasks.map((task, i) => (
                      <div key={i} className="group flex items-start justify-between rounded-2xl border border-border bg-muted/10 p-5 gap-4 hover:border-success/30 hover:bg-success/5 transition-all duration-200">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="mt-1 h-5 w-5 rounded-md border-2 border-muted-foreground/40 shrink-0 group-hover:border-success/50 transition-colors" />
                          <div className="space-y-1 min-w-0">
                            <p className="text-base font-bold text-foreground leading-none">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                            )}
                            {task.due_date && (
                              <p className="text-xs text-warning font-bold flex items-center gap-1.5 mt-2">
                                <Calendar className="h-3.5 w-3.5" /> Due: {task.due_date}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize text-[10px] font-bold px-2 py-0 shrink-0", priorityColors[task.priority] || priorityColors.medium)} 
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                    <div className="h-px w-8 bg-border" />
                    <span>Auto-saved to tasks</span>
                    <div className="h-px w-8 bg-border" />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/5 p-8 text-center">
                  <p className="text-sm text-muted-foreground font-medium">
                    No tasks found in this email
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
