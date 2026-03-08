"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Mail,
  Calendar,
  Target,
  ArrowRight,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const typeIcons: any = {
  urgent: AlertTriangle,
  suggestion: Lightbulb,
  optimization: TrendingUp,
  warning: AlertTriangle,
  task: CheckCircle,
  calendar: Calendar,
}

const typeColors: any = {
  urgent: "text-destructive bg-destructive/10",
  suggestion: "text-primary bg-primary/10",
  optimization: "text-success bg-success/10",
  warning: "text-destructive bg-destructive/10",
  task: "text-success bg-success/10",
  calendar: "text-warning bg-warning/10",
}

const priorityColors: any = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-success/20 text-success border-success/30",
}

export default function InsightsPage() {
  const [stats, setStats] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/ai-insights")
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData)
      }
    } catch (err) {
      console.error("Failed to fetch insights data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !stats) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Generating AI insights...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="AI Insights" />
      <div className="flex-1 space-y-6 p-8">
        {/* Daily Summary */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              Daily AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{stats?.emails_today || 0}</p>
                  <p className="text-xs text-muted-foreground">Emails Processed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-success/10 p-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{stats?.tasks_extracted || 0}</p>
                  <p className="text-xs text-muted-foreground">Tasks Extracted</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-destructive/10 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{stats?.high_priority_tasks || 0}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-warning/10 p-2.5">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{stats?.meetings_scheduled || 0}</p>
                  <p className="text-xs text-muted-foreground">Meetings Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Productivity Score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Recent AI Activity */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <TrendingUp className="h-5 w-5 text-success" />
                Real-time AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const Icon = typeIcons[insight.type] || Sparkles
                  const colorClass = typeColors[insight.type] || "text-primary bg-primary/10"
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("rounded-lg p-2", colorClass)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{insight.message}</p>
                          <p className="text-xs text-muted-foreground">{insight.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
