"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailTable } from "@/components/dashboard/email-table"
import { EmailDetailPanel } from "@/components/dashboard/email-detail-panel"
import { useEmails, type Email } from "@/hooks/use-emails"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle } from "lucide-react"

export default function EmailsPage() {
  const { emails, loading, loadingMore, error, loadMore, hasMore } = useEmails()
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  return (
    <div className="flex h-screen flex-col">
      <Header title="Emails" />
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div
          className={cn(
            "flex-1 overflow-auto p-8 transition-all duration-300",
            selectedEmail ? "lg:w-1/2" : "w-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Live Gmail Inbox</h2>
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
                onSelectEmail={setSelectedEmail as any}
                selectedEmailId={selectedEmail?.id}
                onLoadMore={loadMore}
                hasMore={hasMore}
                loadingMore={loadingMore}
              />
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selectedEmail && (
          <div className="hidden w-1/2 lg:block">
            <EmailDetailPanel
              email={selectedEmail as any}
              onClose={() => setSelectedEmail(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
