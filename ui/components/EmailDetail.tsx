"use client"

import { X, User, Tag, Sparkles, CheckSquare, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Email } from "@/services/api"

interface EmailDetailProps {
  email: Email
  onClose: () => void
}

const priorityColors: Record<string, string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Low: "bg-success/15 text-success border-success/30",
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-muted/10">
        <div className="flex flex-col min-w-0 mr-4">
          <h2 className="text-lg font-bold text-foreground truncate">
            {email.subject}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{email.sender}</span>
            <span>•</span>
            <span>{email.timestamp || "Today"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs font-semibold rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}`, "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Gmail
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-8 p-8 max-w-4xl mx-auto">
          
          {/* Badges Section */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={cn("capitalize text-xs font-semibold px-2.5 py-0.5", priorityColors[email.priority])}>
              {email.priority} priority
            </Badge>
          </div>

          {/* AI Analysis Section */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Executive Insights
            </h3>

            <div className="grid gap-6">
              {/* Summary */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Summary</p>
                <p className="text-base text-foreground leading-relaxed font-medium">
                  {email.summary || "No AI summary available for this email."}
                </p>
              </div>

              {email.cta && (
                <div className="rounded-2xl border border-border bg-muted/20 p-6">
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">Suggested Action</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      {email.cta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Email Body Placeholder */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Email Content
            </h3>
            <div className="rounded-2xl border border-border bg-muted/20 p-6 shadow-inner">
              <p className="text-sm text-muted-foreground italic">
                The full email body is currently unavailable. AI has processed the content and provided the summary above.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
