import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions) as any;
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken");

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Retrieve the user's Google access token from the session
  const accessToken = session.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Gmail access token" }, { status: 403 });
  }

  try {
    // 1. Fetch latest 25 message IDs with pagination support
    let listUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25";
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
    const messages = listData.messages || [];
    const nextPageToken = listData.nextPageToken || null;

    // 2. For each message ID fetch metadata
    const emailDetails = await Promise.all(
      messages.map(async (msg: any) => {
        try {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!detailResponse.ok) return null;

          const detailData = await detailResponse.json();
          const headers = detailData.payload.headers;

          const sender = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
          const subject = headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
          const dateHeader = headers.find((h: any) => h.name === "Date")?.value;
          const date = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

          return {
            id: msg.id,
            sender,
            subject,
            snippet: detailData.snippet,
            date,
          };
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          return null;
        }
      })
    );

    // Return the response with emails and nextPageToken
    return NextResponse.json({
      emails: emailDetails.filter((email) => email !== null),
      nextPageToken,
    });
  } catch (error: any) {
    console.error("Gmail API Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch Gmail inbox." },
      { status: 500 }
    );
  }
}
