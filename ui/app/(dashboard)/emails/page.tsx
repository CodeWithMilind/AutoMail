"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailTable } from "@/components/dashboard/email-table"
import { EmailDetailPanel } from "@/components/dashboard/email-detail-panel"
import { useEmails, type Email } from "@/hooks/use-emails"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function EmailsPage() {
  const { 
    emails, 
    loading, 
    error, 
    currentPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    fetchEmailDetail, 
    selectedEmailDetail, 
    setSelectedEmailDetail, 
    loadingDetail 
  } = useEmails()

  const [analyzing, setAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleAnalyzeEmails = async () => {
    const unanalyzedIds = emails
      .filter(e => !(e as any).is_analyzed)
      .map(e => e.id)
    
    if (unanalyzedIds.length === 0) {
      toast({
        title: "All analyzed",
        description: "All emails on this page have already been analyzed.",
      })
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch("/api/gmail/emails/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_ids: unanalyzedIds }),
      })
      
      if (res.ok) {
        toast({
          title: "Analysis complete",
          description: `Successfully analyzed ${unanalyzedIds.length} emails.`,
        })
        // Reload page to show results
        window.location.reload()
      } else {
        throw new Error("Analysis failed")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to run AI analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSelectEmail = (email: Email) => {
    // Only fetch if we don't already have the full content
    if (email.fullContent === email.snippet) {
      fetchEmailDetail(email.id)
    } else {
      setSelectedEmailDetail(email)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header title="Emails" />
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div
          className={cn(
            "flex-1 overflow-auto p-8 transition-all duration-300",
            selectedEmailDetail ? "lg:w-1/2" : "w-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Live Gmail Inbox</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all gap-2"
                onClick={handleAnalyzeEmails}
                disabled={analyzing || loading || emails.length === 0}
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Emails with AI
              </Button>
            </div>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching your emails...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">Error: {error}</p>
                <p className="text-xs text-muted-foreground mt-1">Please check your Gmail permissions or try signing in again.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {emails.length} latest emails
                </p>
              </div>
              <EmailTable
                emails={emails as any}
                onSelectEmail={handleSelectEmail as any}
                selectedEmailId={selectedEmailDetail?.id}
                onNextPage={nextPage}
                onPrevPage={prevPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                currentPage={currentPage}
                loading={loading}
              />
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selectedEmailDetail && (
          <div className="hidden w-1/2 lg:block relative">
            {loadingDetail && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Analyzing with AI...</p>
                </div>
              </div>
            )}
            <EmailDetailPanel
              email={selectedEmailDetail as any}
              onClose={() => setSelectedEmailDetail(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
