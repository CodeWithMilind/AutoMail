"use client"

import { Header } from "@/components/dashboard/header"
import { EmailList } from "@/components/EmailList"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEmails, useSync } from "@/services/api"
import { cn } from "@/lib/utils"

export default function EmailsPage() {
  const { data: emails = [], isLoading, error, refetch } = useEmails();
  const syncMutation = useSync();

  const handleSync = () => {
    syncMutation.mutate();
  };

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || syncMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && !syncMutation.isPending && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="gap-2"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Now
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                Error Loading Emails
              </p>
              <p className="text-xs text-destructive/80 max-w-sm">{(error as Error).message}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
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
              onClick={() => refetch()}
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
