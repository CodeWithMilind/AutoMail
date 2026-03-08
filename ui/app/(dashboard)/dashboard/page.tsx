"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckSquare, AlertTriangle, Calendar, Loader2 } from "lucide-react"
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
  const [stats, setStats] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/ai-insights")
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json()
        setInsights(insightsData)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading && !stats) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" />
      <div className="flex-1 space-y-6 p-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Emails Today"
            value={stats?.emails_today || 0}
            change="Live from Gmail"
            changeType="neutral"
            icon={Mail}
            iconColor="text-primary"
          />
          <StatCard
            title="Tasks Extracted"
            value={stats?.tasks_extracted || 0}
            change="AI-driven tasks"
            changeType="positive"
            icon={CheckSquare}
            iconColor="text-success"
          />
          <StatCard
            title="High Priority Tasks"
            value={stats?.high_priority_tasks || 0}
            change="Require attention"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <StatCard
            title="Meetings Scheduled"
            value={stats?.meetings_scheduled || 0}
            change="Upcoming today"
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
                  <BarChart data={stats?.weekly_activity || []}>
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
          <AIInsightPanel insights={insights} />
        </div>
      </div>
    </div>
  )
}
