import type { Account } from "@prisma/client"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

/** The Google account has no refresh_token stored — the user must re-consent. */
export class MissingRefreshTokenError extends Error {
  constructor(message = "Account is missing a refresh_token") {
    super(message)
    this.name = "MissingRefreshTokenError"
  }
}

/**
 * Google rejected the refresh_token (revoked, expired, or scope/consent
 * changed). The user must sign in again to obtain a fresh refresh_token.
 */
export class ReauthRequiredError extends Error {
  constructor(message = "Google refresh_token is no longer valid; re-authentication required") {
    super(message)
    this.name = "ReauthRequiredError"
  }
}

/** Any other non-OK response from Google's token endpoint. */
export class TokenRefreshError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TokenRefreshError"
  }
}

export type RefreshedToken = {
  access_token: string
  /** Epoch seconds at which the new access_token expires. */
  expires_at: number
}

/**
 * Exchange a stored refresh_token for a fresh access_token via Google's OAuth
 * token endpoint.
 *
 * Note: Google does NOT return a new refresh_token here, so callers must keep
 * the existing one and never overwrite it with null.
 */
export async function refreshGoogleAccessToken(
  account: Account
): Promise<RefreshedToken> {
  if (!account.refresh_token) {
    throw new MissingRefreshTokenError(
      `Account ${account.id} has no refresh_token`
    )
  }

  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET
  if (!clientId || !clientSecret) {
    throw new TokenRefreshError(
      "Missing AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET environment variables"
    )
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: account.refresh_token,
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    if (data?.error === "invalid_grant") {
      throw new ReauthRequiredError(
        `Google rejected refresh_token for account ${account.id}: invalid_grant`
      )
    }
    throw new TokenRefreshError(
      `Google token refresh failed (${res.status}): ${
        data?.error ?? "unknown_error"
      }${data?.error_description ? ` - ${data.error_description}` : ""}`
    )
  }

  if (!data?.access_token) {
    throw new TokenRefreshError(
      "Google token refresh succeeded but no access_token was returned"
    )
  }

  // Google returns expires_in (seconds from now); fall back to 1h if absent.
  const expiresIn =
    typeof data.expires_in === "number" ? data.expires_in : 3600
  const now = Math.floor(Date.now() / 1000)

  return {
    access_token: data.access_token,
    expires_at: now + expiresIn,
  }
}
