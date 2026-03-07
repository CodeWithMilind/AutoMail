"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { EmailTable } from "@/components/dashboard/email-table"
import { EmailDetailPanel } from "@/components/dashboard/email-detail-panel"
import { emails } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type Email = (typeof emails)[0]

export default function EmailsPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  return (
    <div className="flex h-screen flex-col">
      <Header title="Emails" />
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div
          className={cn(
            "flex-1 overflow-auto p-8 transition-all duration-300",
            selectedEmail ? "lg:w-1/2" : "w-full"
          )}
        >
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {emails.length} emails processed today
            </p>
          </div>
          <EmailTable
            emails={emails}
            onSelectEmail={setSelectedEmail}
            selectedEmailId={selectedEmail?.id}
          />
        </div>

        {/* Detail Panel */}
        {selectedEmail && (
          <div className="hidden w-1/2 lg:block">
            <EmailDetailPanel
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
