"use client"

import { X, Sparkles, CheckSquare, Calendar, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { PriorityBadge } from "./PriorityBadge"
import { AIInsightPanel } from "@/components/dashboard/ai-insight-panel"
import { useState } from "react"
import { api } from "@/services/api"

interface EmailDetailProps {
  email: any
  onClose: () => void
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  const [generatingReply, setGeneratingReply] = useState(false)
  const [reply, setReply] = useState("")

  const handleGenerateReply = async () => {
    setGeneratingReply(true)
    try {
      const data = await api.generateReply(email.id)
      setReply(data.reply)
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingReply(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Email Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{email.subject}</h3>
            <PriorityBadge priority={email.priority} className="mt-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-foreground">{email.sender}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(email.date), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {email.ai_processed && <AIInsightPanel email={email} />}

        <div className="space-y-3 mt-4">
          <span className="text-sm font-semibold text-foreground">Full Email</span>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {email.body || email.snippet}
            </p>
          </div>
        </div>

        {reply && (
          <div className="space-y-3 mt-4">
            <span className="text-sm font-semibold text-primary">AI Suggested Reply</span>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <textarea 
                className="w-full bg-transparent text-sm text-foreground leading-relaxed focus:outline-none"
                rows={10}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={handleGenerateReply}
            disabled={generatingReply}
          >
            {generatingReply ? "Generating..." : "Generate AI Reply"}
          </Button>
          {reply && (
            <Button variant="outline" className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Send Reply
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
