import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard`);
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
