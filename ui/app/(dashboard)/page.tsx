"use client"

import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckSquare, AlertTriangle, Calendar } from "lucide-react"
import { aiInsights, weeklyStats, tasksByPriority } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

const chartData = weeklyStats.days.map((day, index) => ({
  day,
  emails: weeklyStats.emailsProcessed[index],
  tasks: weeklyStats.tasksCreated[index],
}))

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" />
      <div className="flex-1 space-y-6 p-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Emails Today"
            value={52}
            change="+12% from yesterday"
            changeType="positive"
            icon={Mail}
            iconColor="text-primary"
          />
          <StatCard
            title="Tasks Extracted"
            value={11}
            change="+3 from yesterday"
            changeType="positive"
            icon={CheckSquare}
            iconColor="text-success"
          />
          <StatCard
            title="High Priority Tasks"
            value={2}
            change="2 require attention"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <StatCard
            title="Meetings Scheduled"
            value={5}
            change="Next: 10:00 AM"
            changeType="neutral"
            icon={Calendar}
            iconColor="text-warning"
          />
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <AIInsightPanel insights={aiInsights} />
        </div>

        {/* Tasks by Priority */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Tasks by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByPriority}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ priority, count }) => `${priority}: ${count}`}
                      labelLine={false}
                    >
                      {tasksByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Review pending tasks</p>
                  <p className="text-sm text-muted-foreground">5 tasks awaiting approval</p>
                </div>
                <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning">
                  5 Pending
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Unread emails</p>
                  <p className="text-sm text-muted-foreground">1 email requires attention</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  1 New
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Today's meetings</p>
                  <p className="text-sm text-muted-foreground">Next meeting in 2 hours</p>
                </div>
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                  On Track
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
