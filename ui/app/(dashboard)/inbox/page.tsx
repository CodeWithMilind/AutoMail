"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailList } from "@/components/EmailList"
import { EmailDetail } from "@/components/EmailDetail"
import { useEmails, type Email } from "@/hooks/useEmails"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle } from "lucide-react"

export default function InboxPage() {
  const { emails, loading, error } = useEmails()
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  return (
    <div className="flex h-screen flex-col">
      <Header title="Inbox" />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "flex-1 overflow-auto p-8 transition-all duration-300",
            selectedEmail ? "lg:w-1/2" : "w-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Gmail Inbox</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {loading && emails.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">Error: {error}</p>
              </div>
            </div>
          ) : (
            <EmailList
              emails={emails}
              onSelectEmail={setSelectedEmail}
              selectedEmailId={selectedEmail?.id}
            />
          )}
        </div>

        {selectedEmail && (
          <div className="hidden w-1/2 lg:block">
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
