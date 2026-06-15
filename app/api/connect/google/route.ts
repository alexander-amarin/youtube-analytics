import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/", process.env.AUTH_URL ?? "http://localhost:3000")
    )
  }

  const clientId = process.env.AUTH_GOOGLE_ID
  if (!clientId) {
    throw new Error("Missing AUTH_GOOGLE_ID environment variable")
  }

  const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  oauthUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: "http://localhost:3000/api/connect/google/callback",
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  }).toString()

  return NextResponse.redirect(oauthUrl)
}
