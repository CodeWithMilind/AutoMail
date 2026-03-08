import { NextResponse } from "next/server"

// Minimal API route to prevent 404 and infinite loading
export async function GET() {
  try {
    // Try to proxy to backend if it exists, otherwise return mock data
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/emails`, {
      next: { revalidate: 0 } // No cache for testing
    }).catch(() => null)

    if (response && response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }

    // Fallback Mock Data
    const mockEmails = [
      {
        id: "1",
        subject: "Welcome to AutoMail AI",
        sender: "AutoMail Team <hello@automail.ai>",
        date: new Date().toISOString(),
        snippet: "Thank you for joining AutoMail. Your AI executive assistant is ready to help you manage your inbox.",
        priority: "high",
        ai_processed: true,
        summary: "Welcome email from AutoMail team explaining AI assistant features.",
        sentiment: "positive",
        meeting_detected: false,
        requires_followup: false
      },
      {
        id: "2",
        subject: "Project Update: Q1 Roadmap",
        sender: "Product Manager <pm@company.com>",
        date: new Date(Date.now() - 3600000).toISOString(),
        snippet: "We have finalized the roadmap for Q1. Please review the attached document for milestones.",
        priority: "medium",
        ai_processed: false,
        meeting_detected: false,
        requires_followup: true,
        followup_deadline: "Tomorrow"
      }
    ]

    return NextResponse.json(mockEmails)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json([], { status: 500 })
  }
}
