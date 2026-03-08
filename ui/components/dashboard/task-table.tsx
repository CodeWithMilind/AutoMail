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
import { format } from "date-fns"
import { CheckSquare, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: number
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  due_date?: string
  status: string
  email_sender?: string
}

interface TaskTableProps {
  tasks: Task[]
}

export function TaskTable({ tasks }: TaskTableProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CheckSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No tasks found</h3>
        <p className="mt-1 text-xs text-muted-foreground">AI has not extracted any tasks from your emails yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Task</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Due Date</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Source</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-border transition-all duration-150 hover:bg-muted/50">
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "text-sm font-medium text-foreground",
                    task.status === "completed" && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  "text-[10px] uppercase font-bold",
                  task.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" :
                  task.priority === "medium" ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-success/10 text-success border-success/20"
                )}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No deadline</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                  {task.email_sender || "Manual Task"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Badge className={cn(
                  "capitalize text-[10px]",
                  task.status === "completed" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                )}>
                  {task.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
