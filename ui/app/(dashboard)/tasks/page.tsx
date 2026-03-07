"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { TaskTable } from "@/components/dashboard/task-table"
import { tasks as initialTasks } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter } from "lucide-react"

type Task = (typeof initialTasks)[0]

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
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
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
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
            <TaskTable tasks={tasks} onUpdateTask={handleUpdateTask} />
          </TabsContent>

          <TabsContent value="pending">
            <TaskTable tasks={pendingTasks} onUpdateTask={handleUpdateTask} />
          </TabsContent>

          <TabsContent value="approved">
            <TaskTable tasks={approvedTasks} onUpdateTask={handleUpdateTask} />
          </TabsContent>

          <TabsContent value="completed">
            <TaskTable tasks={completedTasks} onUpdateTask={handleUpdateTask} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
