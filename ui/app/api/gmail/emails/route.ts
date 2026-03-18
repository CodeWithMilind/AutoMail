import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken");
  const fetchIdsOnly = searchParams.get("idsOnly") === "true";

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Retrieve the user's Google access token from the session
  const accessToken = session.provider_token;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Gmail access token" }, { status: 403 });
  }

  try {
    if (fetchIdsOnly) {
      // Just fetch message IDs and nextPageToken for progressive loading
      let listUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10";
      if (pageToken) {
        listUrl += `&pageToken=${pageToken}`;
      }

      const listResponse = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!listResponse.ok) {
        const errorData = await listResponse.json();
        throw new Error(errorData.error?.message || "Failed to fetch message list");
      }

      const listData = await listResponse.json();
      return NextResponse.json({
        messages: listData.messages || [],
        nextPageToken: listData.nextPageToken || null,
      });
    }

    // Otherwise, fetch full list metadata (fallback or batch)
    const response = await fetch("http://localhost:8000/gmail/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch emails from Python backend");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gmail API Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch Gmail inbox." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { emailId, mode } = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.provider_token;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing Gmail access token" }, { status: 403 });
  }

  try {
    if (mode === "metadata") {
      // Fetch only metadata for progressive loading
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=metadata`;
      const response = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch metadata");
      const data = await response.json();
      const headers = data.payload.headers;
      
      return NextResponse.json({
        id: emailId,
        sender: headers.find((h: any) => h.name === "From")?.value || "Unknown Sender",
        subject: headers.find((h: any) => h.name === "Subject")?.value || "No Subject",
        date: headers.find((h: any) => h.name === "Date")?.value || new Date().toISOString(),
        snippet: data.snippet || "",
      });
    }

    if (mode === "full") {
      const session = await getServerSession(authOptions) as any
      const accessToken = session?.accessToken
      if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const pythonRes = await fetch(`http://localhost:8000/gmail/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!pythonRes.ok) {
        const err = await pythonRes.json().catch(() => ({}))
        throw new Error(err.detail || `Backend error ${pythonRes.status}`)
      }
      return NextResponse.json(await pythonRes.json())
    }
  } catch (error: any) {
    console.error("Gmail Detail Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch email details." },
      { status: 500 }
    );
  }
}
