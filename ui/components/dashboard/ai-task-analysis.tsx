"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Tag,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  X,
  TrendingUp,
  Lightbulb,
} from "lucide-react"

interface TaskAnalysis {
  id: number
  priority_score: number
  urgency: "critical" | "high" | "medium" | "low"
  category: string
  tags: string[]
  suggested_action: string
  estimated_effort: string
  risk_if_delayed: string
}

interface AnalysisSummary {
  total: number
  critical: number
  categories: Record<string, number>
  top_recommendation: string
}

interface AnalysisResult {
  analysis: TaskAnalysis[]
  summary: AnalysisSummary
}

interface Task {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: string
}

interface Props {
  tasks: Task[]
  onClose?: () => void
}

const urgencyConfig = {
  critical: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", label: "Critical" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", label: "High" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Medium" },
  low: { color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", label: "Low" },
}

const categoryColors: Record<string, string> = {
  Communication: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Development: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Review: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Planning: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Research: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Operations: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HR: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Legal: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

function PriorityBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color =
    score >= 8 ? "bg-red-500" : score >= 6 ? "bg-orange-500" : score >= 4 ? "bg-yellow-500" : "bg-green-500"
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums text-foreground w-5 text-right">{score}</span>
    </div>
  )
}

export function AITaskAnalysis({ tasks, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/tasks/analyze", { method: "POST" })
      if (!res.ok) throw new Error("Analysis failed")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTaskTitle = (id: number) => {
    const task = tasks.find((t) => t.id === id.toString())
    return task?.title || `Task #${id}`
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Sort by priority_score desc
  const sortedAnalysis = result
    ? [...result.analysis].sort((a, b) => b.priority_score - a.priority_score)
    : []

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Task Analysis</h3>
            <p className="text-xs text-muted-foreground">Priority scoring · Categorization · Next actions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <Button
              size="sm"
              onClick={runAnalysis}
              disabled={tasks.length === 0}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              {result ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Re-analyze
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" /> Analyze {tasks.length} Tasks
                </>
              )}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Idle state */}
        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <BarChart2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ready to analyze your tasks</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                AI will score priorities, categorize tasks, and suggest concrete next actions for each item.
              </p>
            </div>
            {tasks.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No tasks available to analyze.</p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing {tasks.length} tasks…</p>
              <p className="text-xs text-muted-foreground mt-1">Scoring priority · Tagging · Generating actions</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Check your AI provider settings (Groq API key / Ollama).</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={runAnalysis}>
              Retry
            </Button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{result.summary.total}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total Tasks</p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{result.summary.critical}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Critical</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(result.summary.categories).length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Categories</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <p className="text-2xl font-bold text-primary">
                  {sortedAnalysis[0]?.priority_score ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Top Score</p>
              </div>
            </div>

            {/* Top recommendation */}
            {result.summary.top_recommendation && (
              <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">AI Recommendation</p>
                  <p className="text-sm text-foreground">{result.summary.top_recommendation}</p>
                </div>
              </div>
            )}

            {/* Category breakdown */}
            {Object.keys(result.summary.categories).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  By Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.summary.categories).map(([cat, count]) => (
                    <span
                      key={cat}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
                        categoryColors[cat] || categoryColors["Other"]
                      )}
                    >
                      <Tag className="h-3 w-3" />
                      {cat} <span className="opacity-70">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Per-task analysis */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Task Breakdown — Sorted by Priority Score
              </p>
              <div className="space-y-2">
                {sortedAnalysis.map((item) => {
                  const urgency = urgencyConfig[item.urgency] || urgencyConfig.medium
                  const isOpen = expanded[item.id]
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-muted/20 overflow-hidden transition-all"
                    >
                      {/* Row header */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                      >
                        {/* Score bar */}
                        <div className="w-32 shrink-0">
                          <PriorityBar score={item.priority_score} />
                        </div>

                        {/* Urgency badge */}
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            urgency.bg,
                            urgency.color
                          )}
                        >
                          {urgency.label}
                        </span>

                        {/* Title */}
                        <span className="flex-1 text-sm font-medium text-foreground truncate">
                          {getTaskTitle(item.id)}
                        </span>

                        {/* Category */}
                        <span
                          className={cn(
                            "hidden sm:inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
                            categoryColors[item.category] || categoryColors["Other"]
                          )}
                        >
                          {item.category}
                        </span>

                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3 border-t border-border bg-muted/10">
                          {/* Tags */}
                          {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-3">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  <Tag className="h-2.5 w-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Suggested action */}
                          <div className="flex gap-2.5 rounded-lg bg-primary/5 border border-primary/15 p-3">
                            <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-0.5">
                                Suggested Next Action
                              </p>
                              <p className="text-xs text-foreground">{item.suggested_action}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Effort */}
                            <div className="flex gap-2 rounded-lg bg-muted/30 border border-border p-2.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">Estimated Effort</p>
                                <p className="text-xs font-medium text-foreground">{item.estimated_effort}</p>
                              </div>
                            </div>
                            {/* Risk */}
                            <div className="flex gap-2 rounded-lg bg-orange-500/5 border border-orange-500/15 p-2.5">
                              <TrendingUp className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">Risk if Delayed</p>
                                <p className="text-xs font-medium text-foreground line-clamp-2">
                                  {item.risk_if_delayed}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
