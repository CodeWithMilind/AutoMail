import "server-only"
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const accessToken = session.provider_token
    if (!accessToken) {
      return NextResponse.json(
        { error: "Gmail access token missing. Sign out and sign in again." },
        { status: 403 }
      )
    }

    // 2. Setup Google OAuth2 client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials({
      access_token: accessToken
    })

    const gmail = google.gmail({ version: "v1", auth })

    // 3. Fetch ONLY first 25 email metadata (fast list)
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 25,
      q: "newer_than:1d"
    })

    const messages = listRes.data.messages || []
    
    // 4. Optimize for speed: Parallel fetch individual message metadata
    const detailedEmails = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detailRes = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"]
          })

          const headers = detailRes.data.payload?.headers || []
          const subject = headers.find(h => h.name === "Subject")?.value || "No Subject"
          const sender = headers.find(h => h.name === "From")?.value || "Unknown Sender"
          const date = headers.find(h => h.name === "Date")?.value || ""

          return {
            id: msg.id,
            subject,
            sender,
            snippet: detailRes.data.snippet || "",
            date
          }
        } catch (err) {
          console.error(`Failed to fetch details for message ${msg.id}:`, err)
          return null // Filtered out later
        }
      })
    )

    // Filter out any failed message fetches and return
    return NextResponse.json(detailedEmails.filter(Boolean))
  } catch (error: any) {
    // 5. Full error protection
    console.error("Gmail API Error:", error)

    if (error?.code === 401 || error?.status === 401) {
      return NextResponse.json(
        { error: "Gmail token expired. Please sign out and sign in again." },
        { status: 401 }
      )
    }
    if (error?.code === 403 || error?.status === 403) {
      return NextResponse.json(
        { error: "Gmail permission denied. Check gmail.readonly scope." },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: error?.message || "Failed to fetch emails from Gmail." },
      { status: 500 }
    )
  }
}
