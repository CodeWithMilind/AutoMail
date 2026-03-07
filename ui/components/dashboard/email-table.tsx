"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  aiSummary: string
  tasksExtracted: number
  date: string
  isRead: boolean
  priority: "high" | "medium" | "low"
}

interface EmailTableProps {
  emails: Email[]
  onSelectEmail: (email: Email) => void
  selectedEmailId?: string
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", className: "bg-success/20 text-success border-success/30" },
}

export function EmailTable({ emails, onSelectEmail, selectedEmailId }: EmailTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Sender</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Subject</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">AI Summary</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-center">Tasks</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => {
            const priority = priorityConfig[email.priority]
            return (
              <TableRow
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={cn(
                  "cursor-pointer border-border transition-all duration-150 hover:bg-muted/50",
                  selectedEmailId === email.id && "bg-primary/5 hover:bg-primary/10",
                  !email.isRead && "bg-muted/30"
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {!email.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    <span className={cn(!email.isRead && "font-semibold")}>
                      {email.sender}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(!email.isRead && "font-semibold")}>
                  {email.subject}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {email.aiSummary}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {email.tasksExtracted}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={priority.className}>
                    {priority.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
