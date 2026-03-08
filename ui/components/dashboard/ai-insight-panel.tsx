"use client"

import { Sparkles, AlertTriangle, CheckCircle, Clock, Calendar, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Insight {
  id?: string
  type: "warning" | "task" | "calendar" | "info" | "success"
  message: string
  time: string
  summary?: string
  priority?: string
  sentiment?: string
}

interface AIInsightPanelProps {
  insights?: Insight[]
  insight?: Insight
  email?: any
  className?: string
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  task: {
    icon: CheckSquare,
    color: "text-success",
    bg: "bg-success/10",
  },
  calendar: {
    icon: Calendar,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  info: {
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
  },
}

export function AIInsightPanel({ insights, insight, email, className }: AIInsightPanelProps) {
  // If it's a single insight as requested in the user's example
  if (insight || email) {
    const data = insight || email
    return (
      <div className={cn("p-4 border rounded-lg bg-card shadow-sm", className)}>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </h2>
        {data ? (
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed"><strong className="text-muted-foreground">Summary:</strong> {data.summary || data.ai_summary}</p>
            <p className="flex items-center gap-2"><strong className="text-muted-foreground">Priority:</strong> 
              <Badge variant="outline" className={cn(
                "capitalize",
                data.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" :
                data.priority === "medium" ? "bg-warning/10 text-warning border-warning/20" :
                "bg-success/10 text-success border-success/20"
              )}>
                {data.priority}
              </Badge>
            </p>
            <p className="flex items-center gap-2"><strong className="text-muted-foreground">Sentiment:</strong> 
              <Badge variant="outline" className={cn(
                "capitalize",
                data.sentiment === "positive" ? "bg-success/10 text-success border-success/20" :
                data.sentiment === "negative" ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-muted text-muted-foreground border-border"
              )}>
                {data.sentiment || "Neutral"}
              </Badge>
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No insights available</p>
        )}
      </div>
    )
  }

  // Fallback to the plural insights list for the dashboard
  return (
    <Card className={cn("bg-card border-border shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights && insights.map((item, index) => {
          const config = typeConfig[item.type] || typeConfig.info
          const Icon = config.icon
          return (
            <div
              key={item.id || index}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className={cn("rounded-md p-1.5", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground leading-tight">{item.message}</p>
                <p className="mt-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.time}</p>
              </div>
            </div>
          )
        })}
        {(!insights || insights.length === 0) && (
          <div className="flex h-32 flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No insights detected yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

