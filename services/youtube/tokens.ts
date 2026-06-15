import type { Account } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { refreshGoogleAccessToken } from "./refresh"

/** No Google account is linked to the given user. */
export class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AccountNotFoundError"
  }
}

/** Seconds of headroom before true expiry at which we proactively refresh. */
const EXPIRY_BUFFER_SECONDS = 60

/**
 * Shared logic: given an Account row, return a valid access token, refreshing
 * and persisting a new one if the stored token is missing or (about to be)
 * expired.
 */
async function resolveValidAccessToken(account: Account): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const isValid =
    account.access_token != null &&
    account.expires_at != null &&
    account.expires_at - EXPIRY_BUFFER_SECONDS > now

  if (isValid) {
    return account.access_token as string
  }

  const refreshed = await refreshGoogleAccessToken(account)

  // Persist only the new access_token + expiry. Never touch refresh_token:
  // Google does not return a new one, so the existing value must be preserved.
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: refreshed.access_token,
      expires_at: refreshed.expires_at,
    },
  })

  return refreshed.access_token
}

/**
 * Return a currently-valid Google access token for the user's first linked
 * Google account, refreshing and persisting if needed.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })

  if (!account) {
    throw new AccountNotFoundError(
      `No Google account linked for user ${userId}`
    )
  }

  return resolveValidAccessToken(account)
}

/**
 * Return a currently-valid access token for a specific Account, refreshing and
 * persisting if needed. Used for multi-account (per-channel) token routing.
 */
export async function getValidAccessTokenForAccount(
  accountId: string
): Promise<string> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  })

  if (!account) {
    throw new AccountNotFoundError(`No account found with id ${accountId}`)
  }

  return resolveValidAccessToken(account)
}
