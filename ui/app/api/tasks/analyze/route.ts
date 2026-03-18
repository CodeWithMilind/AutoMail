import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Backend analysis failed");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
