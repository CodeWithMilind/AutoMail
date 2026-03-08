"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { TaskTable } from "@/components/dashboard/task-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface Task {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: "pending" | "approved" | "completed"
  dueDate: string
  source: string
  email_id?: string
}

export default function TasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      
      // Map backend fields to frontend Task interface
      const mappedTasks = data.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date || t.created_at,
        source: t.email_sender ? `Email from ${t.email_sender}` : "Manual Task",
        email_id: t.email_id
      }))
      
      setTasks(mappedTasks)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      
      if (!res.ok) throw new Error("Failed to update task")
      
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
      )
      
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete task")
      
      setTasks((prev) => prev.filter((task) => task.id !== id))
      
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const approvedTasks = tasks.filter((t) => t.status === "approved")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Tasks" />
      <div className="flex-1 space-y-6 p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {tasks.length} total tasks - {pendingTasks.length} pending, {approvedTasks.length} approved, {completedTasks.length} completed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTasks} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">Error: {error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchTasks}>Retry</Button>
            </div>
          </div>
        ) : loading && tasks.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="all">
                All Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TaskTable tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            </TabsContent>

            <TabsContent value="pending">
              <TaskTable tasks={pendingTasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            </TabsContent>

            <TabsContent value="approved">
              <TaskTable tasks={approvedTasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            </TabsContent>

            <TabsContent value="completed">
              <TaskTable tasks={completedTasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
