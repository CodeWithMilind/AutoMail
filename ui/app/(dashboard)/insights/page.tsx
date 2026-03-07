"use client"

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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { aiInsights, tasks, emails } from "@/lib/mock-data"

const dailySummary = {
  emailsProcessed: 52,
  tasksExtracted: 11,
  highPriorityTasks: 2,
  meetingsScheduled: 5,
  productivityScore: 87,
}

const suggestedActions = [
  {
    id: "1",
    type: "urgent" as const,
    title: "Prepare Investor Update",
    description: "Michael Ross is expecting the Q4 performance update by end of week. Consider delegating data collection.",
    action: "View Task",
  },
  {
    id: "2",
    type: "suggestion" as const,
    title: "Reschedule Conflicting Meetings",
    description: "Two meetings are scheduled at 2:00 PM on Thursday. The Partnership call could be moved to 4:00 PM.",
    action: "View Calendar",
  },
  {
    id: "3",
    type: "optimization" as const,
    title: "Batch Similar Tasks",
    description: "3 tasks involve reviewing documents. Consider batching these for efficiency.",
    action: "View Tasks",
  },
]

const importantFlags = [
  {
    id: "1",
    title: "Investor Update Due Soon",
    priority: "high" as const,
    source: "Email from Michael Ross",
    dueIn: "4 days",
  },
  {
    id: "2",
    title: "New Hire Onboarding Pending",
    priority: "medium" as const,
    source: "Email from Lisa Wang",
    dueIn: "3 days",
  },
  {
    id: "3",
    title: "Budget Review Meeting",
    priority: "high" as const,
    source: "Email from Sarah Chen",
    dueIn: "2 days",
  },
]

const typeIcons = {
  urgent: AlertTriangle,
  suggestion: Lightbulb,
  optimization: TrendingUp,
}

const typeColors = {
  urgent: "text-destructive bg-destructive/10",
  suggestion: "text-primary bg-primary/10",
  optimization: "text-success bg-success/10",
}

const priorityColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-success/20 text-success border-success/30",
}

export default function InsightsPage() {
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
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{dailySummary.emailsProcessed}</p>
                  <p className="text-xs text-muted-foreground">Emails Processed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-success/10 p-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{dailySummary.tasksExtracted}</p>
                  <p className="text-xs text-muted-foreground">Tasks Extracted</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-destructive/10 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{dailySummary.highPriorityTasks}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-warning/10 p-2.5">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{dailySummary.meetingsScheduled}</p>
                  <p className="text-xs text-muted-foreground">Meetings Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{dailySummary.productivityScore}%</p>
                  <p className="text-xs text-muted-foreground">Productivity Score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Suggested Actions */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Lightbulb className="h-5 w-5 text-warning" />
                Suggested Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedActions.map((action) => {
                const Icon = typeIcons[action.type]
                const colorClass = typeColors[action.type]
                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("rounded-lg p-2", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-foreground">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {action.action}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Important Tasks Flagged */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Important Tasks Flagged by AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {importantFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start justify-between rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{flag.title}</h4>
                      <Badge variant="outline" className={priorityColors[flag.priority]}>
                        {flag.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.source}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      flag.priority === "high" ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                      Due in {flag.dueIn}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent AI Activity */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <TrendingUp className="h-5 w-5 text-success" />
              Recent AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight) => {
                const typeConfig = {
                  urgent: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
                  info: { icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
                  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
                  warning: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
                }
                const config = typeConfig[insight.type]
                const Icon = config.icon
                return (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn("rounded-lg p-2", config.bg)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{insight.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{insight.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
