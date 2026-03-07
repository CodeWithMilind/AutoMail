"use client"

import { X, Sparkles, CheckSquare, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  fullContent: string
  aiSummary: string
  tasksExtracted: number
  tasks: string[]
  date: string
  isRead: boolean
  priority: "high" | "medium" | "low"
}

interface EmailDetailPanelProps {
  email: Email
  onClose: () => void
}

const priorityConfig = {
  high: { label: "High Priority", className: "bg-destructive/20 text-destructive" },
  medium: { label: "Medium Priority", className: "bg-warning/20 text-warning" },
  low: { label: "Low Priority", className: "bg-success/20 text-success" },
}

export function EmailDetailPanel({ email, onClose }: EmailDetailPanelProps) {
  const priority = priorityConfig[email.priority]

  return (
    <div className="flex h-full flex-col border-l border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Email Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Email Header Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{email.subject}</h3>
            <Badge className={cn("mt-2", priority.className)}>{priority.label}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-foreground">{email.sender}</p>
              <p className="text-muted-foreground">{email.senderEmail}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(email.date), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* AI Summary */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Summary</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{email.aiSummary}</p>
        </div>

        <Separator className="my-4" />

        {/* Extracted Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold text-foreground">
              Extracted Tasks ({email.tasks.length})
            </span>
          </div>
          <div className="space-y-2">
            {email.tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-semibold text-success">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground">{task}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Full Email Content */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-foreground">Full Email</span>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {email.fullContent}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            <CheckSquare className="mr-2 h-4 w-4" />
            Approve All Tasks
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Tasks
          </Button>
        </div>
      </div>
    </div>
  )
}
