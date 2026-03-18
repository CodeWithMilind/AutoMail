"use client"

import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, CheckSquare, AlertTriangle, Calendar, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useEmails, useTasks, useMeetings, useInsights, useSync } from "@/services/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const { data: emails = [], isLoading: isLoadingEmails, error: emailsError, refetch: refetchEmails } = useEmails();
  const { data: tasks = [], isLoading: isLoadingTasks, error: tasksError, refetch: refetchTasks } = useTasks();
  const { data: meetings = [], isLoading: isLoadingMeetings, error: meetingsError, refetch: refetchMeetings } = useMeetings();
  const { data: insights = [], isLoading: isLoadingInsights, error: insightsError, refetch: refetchInsights } = useInsights();
  
  const syncMutation = useSync();

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleRetry = () => {
    refetchEmails();
    refetchTasks();
    refetchMeetings();
    refetchInsights();
  };

  const highPriorityTasks = tasks.filter(t => t.priority === "High").length;
  const isLoading = isLoadingEmails || isLoadingTasks || isLoadingMeetings || isLoadingInsights;
  const error = emailsError || tasksError || meetingsError || insightsError;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" />
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <Button 
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
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load some dashboard data. Please try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-auto h-8 border-destructive/50 text-destructive hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-3 w-32 mt-2" />
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="Emails Today"
                value={emails.length}
                change="Live from Gmail"
                changeType="neutral"
                icon={Mail}
                iconColor="text-primary"
              />
              <StatCard
                title="Tasks Extracted"
                value={tasks.length}
                change="AI-driven tasks"
                changeType="positive"
                icon={CheckSquare}
                iconColor="text-success"
              />
              <StatCard
                title="High Priority Tasks"
                value={highPriorityTasks}
                change="Require attention"
                changeType="negative"
                icon={AlertTriangle}
                iconColor="text-destructive"
              />
              <StatCard
                title="Meetings Scheduled"
                value={meetings.length}
                change="Upcoming today"
                changeType="neutral"
                icon={Calendar}
                iconColor="text-warning"
              />
            </>
          )}
        </div>

        {/* Charts and Insights Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Emails & Tasks Chart */}
          <Card className="bg-card border-border shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="day"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--popover-foreground)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="emails"
                        name="Emails Processed"
                        fill="var(--chart-1)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="tasks"
                        name="Tasks Created"
                        fill="var(--chart-2)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {isLoading ? (
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <AIInsightPanel insights={insights} />
          )}
        </div>
      </div>
    </div>
  )
}
