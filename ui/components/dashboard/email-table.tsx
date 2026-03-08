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
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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
  onNextPage?: () => void
  onPrevPage?: () => void
  hasNextPage?: boolean
  hasPrevPage?: boolean
  currentPage?: number
  loading?: boolean
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", className: "bg-success/20 text-success border-success/30" },
}

export function EmailTable({ 
  emails, 
  onSelectEmail, 
  selectedEmailId,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  currentPage,
  loading
}: EmailTableProps) {
  return (
    <div className="flex flex-col gap-4">
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
            {loading && emails.length === 0 ? (
              // Initial loading skeletons
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={`skeleton-init-${i}`} className="animate-pulse border-border">
                  <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-48 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-64 rounded bg-muted" /></TableCell>
                  <TableCell><div className="mx-auto h-6 w-8 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-6 w-16 rounded bg-muted" /></TableCell>
                  <TableCell><div className="ml-auto h-4 w-20 rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {emails.map((email, index) => {
                  const priority = priorityConfig[email.priority]
                  return (
                    <TableRow
                      key={`${email.id}-${index}`}
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
                {/* Progressive loading skeletons for remaining rows */}
                {loading && emails.length > 0 && emails.length < 10 && 
                  Array.from({ length: 10 - emails.length }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="animate-pulse border-border opacity-50">
                      <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-4 w-48 rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-4 w-64 rounded bg-muted" /></TableCell>
                      <TableCell><div className="mx-auto h-6 w-8 rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-6 w-16 rounded bg-muted" /></TableCell>
                      <TableCell><div className="ml-auto h-4 w-20 rounded bg-muted" /></TableCell>
                    </TableRow>
                  ))
                }
              </>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{currentPage}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrevPage} 
            disabled={!hasPrevPage || loading}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onNextPage} 
            disabled={!hasNextPage || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
