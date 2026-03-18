"use client"

import { Header } from "@/components/dashboard/header"
import { TaskTable } from "@/components/dashboard/task-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useTasks, useSync } from "@/services/api"
import { cn } from "@/lib/utils"

export default function TasksPage() {
  const { data: tasks = [], isLoading, error, refetch } = useTasks();
  const syncMutation = useSync();

  const handleSync = () => {
    syncMutation.mutate();
  };

  const pendingTasks = tasks.filter((t) => t.status === "Pending")
  const completedTasks = tasks.filter((t) => t.status === "Completed")
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress")

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Tasks" />
      <div className="flex-1 space-y-6 p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Task Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-48 mt-1" />
              ) : (
                `${tasks.length} total tasks — ${pendingTasks.length} pending, ${inProgressTasks.length} in progress, ${completedTasks.length} completed`
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || syncMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && !syncMutation.isPending && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="gap-2"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Now
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">Error: {(error as Error).message}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-[400px]" />
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TaskTable tasks={tasks} />
            </TabsContent>
            <TabsContent value="pending">
              <TaskTable tasks={pendingTasks} />
            </TabsContent>
            <TabsContent value="progress">
              <TaskTable tasks={inProgressTasks} />
            </TabsContent>
            <TabsContent value="completed">
              <TaskTable tasks={completedTasks} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
