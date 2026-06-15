/** A normalized error from the YouTube / Google APIs. */
export class YouTubeApiError extends Error {
  /** HTTP status code of the response. */
  status: number
  /** Google error reason/status (e.g. "quotaExceeded", "authError"), if present. */
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "YouTubeApiError"
    this.status = status
    this.code = code
  }
}

/** Shape of Google's standard API error envelope. */
interface GoogleErrorBody {
  error?: {
    code?: number
    message?: string
    status?: string
    errors?: Array<{ reason?: string; message?: string }>
  }
}

/**
 * Authenticated GET against a Google API endpoint that returns JSON.
 * Adds the Bearer token, parses the body, and normalizes Google's error
 * envelope into a YouTubeApiError.
 */
export async function ytFetch<T>(accessToken: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  })

  const data = (await res.json().catch(() => null)) as
    | (T & GoogleErrorBody)
    | null

  if (!res.ok) {
    const err = data?.error
    const message =
      err?.message ?? res.statusText ?? "YouTube API request failed"
    const code = err?.errors?.[0]?.reason ?? err?.status
    throw new YouTubeApiError(
      `YouTube API error (${res.status}): ${message}`,
      res.status,
      code
    )
  }

  if (data == null) {
    throw new YouTubeApiError(
      "YouTube API returned an empty or invalid JSON body",
      res.status
    )
  }

  return data as T
}
