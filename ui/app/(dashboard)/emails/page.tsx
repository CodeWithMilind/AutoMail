"use client"

import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailList } from "@/components/EmailList"
import { Loader2, Mail, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmailsPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/emails", { cache: "no-cache" })

      if (!res.ok) {
        let message = `Server error (${res.status})`
        try {
          const errData = await res.json()
          message = errData.error || message
        } catch {}
        throw new Error(message)
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        if (data?.error) throw new Error(data.error)
        throw new Error("Unexpected response from server")
      }

      setEmails(data)
    } catch (err: any) {
      console.error("Email fetch failed:", err)
      setError(err.message || "Failed to load emails")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmails()
  }, [loadEmails])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Emails" />
        <div className="flex flex-1 items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Loading emails...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Emails" />
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Inbox
            </h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Showing today&apos;s emails from Gmail
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmails}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                Error Loading Emails
              </p>
              <p className="text-xs text-destructive/80 max-w-sm">{error}</p>
              {(error.includes("token") ||
                error.includes("sign in") ||
                error.includes("401")) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Try signing out and signing back in to refresh Gmail access.
                </p>
              )}
              <Button
                onClick={loadEmails}
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              No emails found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              No emails received today, or inbox not synced yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEmails}
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Check again
            </Button>
          </div>
        ) : (
          <EmailList
            emails={emails}
            onSelectEmail={(email) => {
              window.location.href = `/inbox?id=${email.id}`
            }}
          />
        )}
      </div>
    </div>
  )
}
