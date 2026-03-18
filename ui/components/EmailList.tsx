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
import { PriorityBadge } from "./PriorityBadge"
import { Email } from "@/services/api"
import { Button } from "./ui/button"

interface EmailListProps {
  emails: Email[]
  onSelectEmail: (email: Email) => void
  selectedEmailId?: string
}

export function EmailList({ 
  emails, 
  onSelectEmail, 
  selectedEmailId
}: EmailListProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Sender</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Subject</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">AI Summary</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={cn(
                "cursor-pointer border-border transition-all duration-150 hover:bg-muted/50",
                selectedEmailId === email.id && "bg-primary/5 hover:bg-primary/10"
              )}
            >
              <TableCell className="font-medium">
                {email.sender}
              </TableCell>
              <TableCell>
                {email.subject}
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {email.summary || "No analysis yet"}
              </TableCell>
              <TableCell>
                <PriorityBadge priority={email.priority.toLowerCase() as any} />
              </TableCell>
              <TableCell className="text-right">
                {email.cta ? (
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    {email.cta}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No action</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
