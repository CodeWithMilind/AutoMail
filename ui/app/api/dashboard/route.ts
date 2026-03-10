import { NextResponse } from "next/server"
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, { cache: "no-store" })
    if (!res.ok) throw new Error("Backend error")
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({
      emails_today: 0, 
      tasks_extracted: 0,
      high_priority_tasks: 0, 
      meetings_scheduled: 0,
      weekly_activity: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({ day, emails: 0, tasks: 0 }))
    })
  }
}
