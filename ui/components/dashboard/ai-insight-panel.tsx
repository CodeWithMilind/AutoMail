"use client"

import { Sparkles, AlertTriangle, CheckCircle, Calendar, CheckSquare, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Insight } from "@/services/api"

interface AIInsightPanelProps {
  insights: Insight[]
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
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
  },
}

export function AIInsightPanel({ insights, className }: AIInsightPanelProps) {
  return (
    <Card className={cn("bg-card border-border shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground italic">No insights generated yet.</p>
          </div>
        ) : (
          insights.map((insight) => {
            const config = typeConfig[insight.type as keyof typeof typeConfig] || typeConfig.info
            const Icon = config.icon

            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className={cn("mt-0.5 rounded-full p-1.5", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-tight text-foreground">{insight.message}</p>
                  <p className="text-[10px] text-muted-foreground">{insight.timestamp}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
