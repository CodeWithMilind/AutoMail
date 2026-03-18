"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { api, Meeting } from "@/services/api"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.fetchMeetings()
      setMeetings(data)
    } catch (err: any) {
      console.error("Meeting fetch failed:", err)
      setError(err.message || "Failed to load meetings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  // Convert API meetings to Calendar events
  const events = meetings.map(m => ({
    id: m.id,
    title: m.title,
    date: m.date,
    time: m.time,
    type: "meeting" as const,
  }))

  if (loading && meetings.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Calendar" />
        <div className="flex flex-1 items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Loading calendar...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Calendar" />
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Your Schedule
            </h1>
            <p className="text-sm text-muted-foreground">
              {meetings.length} meetings scheduled for today
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadMeetings}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">Error: {error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={loadMeetings}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <CalendarView events={events} />
        )}
      </div>
    </div>
  )
}
