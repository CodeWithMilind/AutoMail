import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low"
  className?: string
}

const priorityConfig = {
  high: { label: "High Priority", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium Priority", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low Priority", className: "bg-success/20 text-success border-success/30" },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.medium
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
