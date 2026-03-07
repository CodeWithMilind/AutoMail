"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, X, Pencil, MoreHorizontal, Calendar, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: "pending" | "approved" | "completed"
  dueDate: string
  source: string
}

interface TaskTableProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", className: "bg-success/20 text-success border-success/30" },
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completed", className: "bg-success/20 text-success border-success/30" },
}

export function TaskTable({ tasks, onUpdateTask }: TaskTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider w-[40%]">Task</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Due Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const priority = priorityConfig[task.priority]
            const status = statusConfig[task.status]
            return (
              <TableRow key={task.id} className="border-border hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="space-y-1">
                    <p className={cn(
                      "font-medium text-foreground",
                      task.status === "completed" && "line-through opacity-60"
                    )}>
                      {task.title}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {task.source}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={priority.className}>
                    {priority.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {task.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:bg-success/10 hover:text-success"
                          onClick={() => onUpdateTask(task.id, { status: "approved" })}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onUpdateTask(task.id, { status: "completed" })}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                    {task.status === "approved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success hover:bg-success/10 hover:text-success"
                        onClick={() => onUpdateTask(task.id, { status: "completed" })}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Complete</span>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <X className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
