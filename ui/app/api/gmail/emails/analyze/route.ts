import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = "http://localhost:8000";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Gmail access token" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/analyze-emails`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to run AI analysis");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
