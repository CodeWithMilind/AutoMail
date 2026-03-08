import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-insights`);
    if (!response.ok) throw new Error("Failed to fetch AI insights");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
