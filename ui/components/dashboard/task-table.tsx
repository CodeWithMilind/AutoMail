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
import { CheckSquare, Clock, Loader2 } from "lucide-react"
import { Task, useUpdateTask } from "@/services/api"
import { Checkbox } from "@/components/ui/checkbox"

interface TaskTableProps {
  tasks: Task[]
}

export function TaskTable({ tasks }: TaskTableProps) {
  const updateTaskMutation = useUpdateTask();

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    updateTaskMutation.mutate({ id: task.id, status: newStatus });
  };

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
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Task</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Deadline</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wider text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-border transition-all duration-150 hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center justify-center">
                  {updateTaskMutation.isPending && updateTaskMutation.variables?.id === task.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Checkbox 
                      checked={task.status === "Completed"} 
                      onCheckedChange={() => handleToggleStatus(task)}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "text-sm font-medium text-foreground transition-all",
                    task.status === "Completed" && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  "text-[10px] uppercase font-bold",
                  task.priority === "High" ? "bg-destructive/10 text-destructive border-destructive/20" :
                  task.priority === "Medium" ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-success/10 text-success border-success/20"
                )}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.deadline ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.deadline}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No deadline</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge className={cn(
                  "capitalize text-[10px]",
                  task.status === "Completed" ? "bg-success/10 text-success border-success/20" :
                  task.status === "In Progress" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-muted text-muted-foreground"
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
