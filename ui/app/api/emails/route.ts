import "server-only"
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // 1. Safely handle authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Setup Google OAuth2 client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials({
      access_token: (session as any).accessToken
    })

    const gmail = google.gmail({ version: "v1", auth })

    // 3. Fetch ONLY first 25 email metadata (fast list)
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 25,
      q: "in:inbox"
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
