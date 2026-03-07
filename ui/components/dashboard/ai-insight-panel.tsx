import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  id: string
  type: "urgent" | "info" | "success" | "warning"
  message: string
  timestamp: string
}

interface AIInsightPanelProps {
  insights: Insight[]
  className?: string
}

const typeConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
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
  warning: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
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
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type]
          const Icon = config.icon
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className={cn("rounded-md p-1.5", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{insight.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{insight.timestamp}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
