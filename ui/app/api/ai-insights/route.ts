import { NextResponse } from "next/server"
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai-insights`, { cache: "no-store" })
    if (!res.ok) throw new Error("Backend error")
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json([])
  }
}
