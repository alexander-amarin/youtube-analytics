import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const appUrl = process.env.AUTH_URL ?? "http://localhost:3000"
const REDIRECT_URI = `${appUrl}/api/connect/google/callback`

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", appUrl))
  }

  const code = request.nextUrl.searchParams.get("code")
  if (!code) {
    throw new Error("Missing 'code' query parameter in OAuth callback")
  }

  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET environment variables"
    )
  }

  // 1. Exchange the authorization code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  })

  const tokens = await tokenRes.json().catch(() => null)
  if (!tokenRes.ok || !tokens?.access_token) {
    throw new Error(
      `Google token exchange failed (${tokenRes.status}): ${
        tokens?.error ?? "unknown_error"
      }${tokens?.error_description ? ` - ${tokens.error_description}` : ""}`
    )
  }

  // 2. Fetch the Google profile for this account.
  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  )

  const googleUser = await userRes.json().catch(() => null)
  if (!userRes.ok || !googleUser?.id) {
    throw new Error(
      `Failed to fetch Google user profile (${userRes.status})`
    )
  }

  // 3. Upsert the linked Account for the current user.
  const now = Math.floor(Date.now() / 1000)
  const expiresAt =
    typeof tokens.expires_in === "number" ? now + tokens.expires_in : null
  const providerAccountId = String(googleUser.id)

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId,
      },
    },
    create: {
      userId: session.user.id,
      type: "oauth",
      provider: "google",
      providerAccountId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      scope: tokens.scope ?? null,
      token_type: tokens.token_type ?? null,
      id_token: tokens.id_token ?? null,
    },
    update: {
      access_token: tokens.access_token,
      expires_at: expiresAt,
      scope: tokens.scope ?? null,
      token_type: tokens.token_type ?? null,
      id_token: tokens.id_token ?? null,
      // Google does not always return a refresh_token; only overwrite when
      // present so the existing value is preserved.
      ...(tokens.refresh_token
        ? { refresh_token: tokens.refresh_token }
        : {}),
    },
  })

  // 4. Back to the channels page.
  return NextResponse.redirect(new URL("/channels", appUrl))
}
