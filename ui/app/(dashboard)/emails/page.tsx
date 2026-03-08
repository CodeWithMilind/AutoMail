"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailList } from "@/components/EmailList"
import { Loader2, Mail, AlertCircle } from "lucide-react"

export default function EmailsPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEmails = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/emails", { cache: 'no-store' })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        setEmails(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err: any) {
        console.error("Failed to load emails:", err)
        setError(err.message || "An unexpected error occurred while loading emails.")
      } finally {
        setLoading(false)
      }
    }

    loadEmails()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Emails" />
        <div className="flex flex-1 items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading emails...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Emails" />
      <div className="flex-1 p-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Manage your synchronized Gmail messages and AI analysis insights.
          </p>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Error Loading Emails</p>
              <p className="text-xs text-destructive/80">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">No emails found</h3>
            <p className="mt-1 text-xs text-muted-foreground">Your inbox is empty or hasn't been synchronized yet.</p>
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
