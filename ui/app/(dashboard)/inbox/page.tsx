"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { EmailList } from "@/components/EmailList"
import { EmailDetail } from "@/components/EmailDetail"
import { useEmails, type Email } from "@/hooks/useEmails"
import { Loader2, AlertCircle } from "lucide-react"

function InboxContent() {
  const { emails, loading, error } = useEmails()
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailId = searchParams.get("id")
    if (!emailId || emails.length === 0) return
    const found = emails.find((e) => e.id === emailId)
    if (found) setSelectedEmail(found)
  }, [searchParams, emails])

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
    window.history.pushState({}, "", `/inbox?id=${email.id}`)
  }

  const handleClose = () => {
    setSelectedEmail(null)
    window.history.pushState({}, "", "/inbox")
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Email list - ALWAYS visible in the background */}
      <div className="flex-1 overflow-auto p-8">
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
            onSelectEmail={handleSelectEmail}
            selectedEmailId={selectedEmail?.id}
          />
        )}
      </div>

      {/* Full screen modal popup - overlay on top of the list */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <EmailDetail email={selectedEmail} onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function InboxPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header title="Inbox" />
      <Suspense fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <InboxContent />
      </Suspense>
    </div>
  )
}
