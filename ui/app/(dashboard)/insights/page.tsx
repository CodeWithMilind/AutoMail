"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Mail,
  Calendar,
  Target,
  ArrowRight,
  Lightbulb,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEmails, useTasks, useMeetings, useInsights, useSync } from "@/services/api"

const typeIcons: any = {
  urgent: AlertTriangle,
  suggestion: Lightbulb,
  optimization: TrendingUp,
  warning: AlertTriangle,
  task: CheckCircle,
  calendar: Calendar,
  info: Sparkles,
  success: CheckCircle,
}

const typeColors: any = {
  urgent: "text-destructive bg-destructive/10",
  suggestion: "text-primary bg-primary/10",
  optimization: "text-success bg-success/10",
  warning: "text-destructive bg-destructive/10",
  task: "text-success bg-success/10",
  calendar: "text-warning bg-warning/10",
  info: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
}

export default function InsightsPage() {
  const { data: emails = [], isLoading: isLoadingEmails } = useEmails();
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks();
  const { data: meetings = [], isLoading: isLoadingMeetings } = useMeetings();
  const { data: insights = [], isLoading: isLoadingInsights, error, refetch } = useInsights();
  
  const syncMutation = useSync();

  const handleSync = () => {
    syncMutation.mutate();
  };

  const highPriorityTasks = tasks.filter(t => t.priority === "High").length;
  const isLoading = isLoadingEmails || isLoadingTasks || isLoadingMeetings || isLoadingInsights;

  if (isLoading && insights.length === 0) {
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
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => refetch()} 
              disabled={isLoading || syncMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && !syncMutation.isPending && "animate-spin")} />
              Refresh
            </Button>
            <Button 
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

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load insights. Please try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-auto h-8 border-destructive/50 text-destructive hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        )}

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
              {[
                { label: "Emails Processed", value: emails.length, icon: Mail, color: "primary" },
                { label: "Tasks Extracted", value: tasks.length, icon: CheckCircle, color: "success" },
                { label: "High Priority", value: highPriorityTasks, icon: AlertTriangle, color: "destructive" },
                { label: "Meetings Today", value: meetings.length, icon: Calendar, color: "warning" },
                { label: "Productivity Score", value: "85%", icon: Target, color: "primary" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                  <div className={cn("rounded-xl p-2.5", `bg-${stat.color}/10`)}>
                    <stat.icon className={cn("h-5 w-5", `text-${stat.color}`)} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
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
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  ))
                ) : insights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">No insights available yet</p>
                    <p className="text-xs text-muted-foreground">Sync your emails to generate AI insights</p>
                  </div>
                ) : (
                  insights.map((insight) => {
                    const Icon = typeIcons[insight.type] || Sparkles
                    const colorClass = typeColors[insight.type] || "text-primary bg-primary/10"
                    
                    return (
                      <div
                        key={insight.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("rounded-lg p-2", colorClass)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{insight.message}</p>
                            <p className="text-xs text-muted-foreground">{insight.timestamp}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
