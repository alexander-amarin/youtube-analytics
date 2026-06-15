import { getValidAccessTokenForAccount } from "./tokens"
import { ytFetch } from "./client"
import { toNumber } from "@/services/youtube/utils"

// --- Raw YouTube Analytics API response shape (reports.query) ---

interface YtAnalyticsResponse {
  columnHeaders?: Array<{
    name?: string
    columnType?: string
    dataType?: string
  }>
  // Each row is positional, matching columnHeaders: [day, views]
  rows?: Array<Array<string | number>>
}

// --- Domain object ---

export interface AnalyticsPoint {
  date: string
  views: number
}

const REPORTS_URL = "https://youtubeanalytics.googleapis.com/v2/reports"

/** Format a Date as YYYY-MM-DD (UTC), as required by the Analytics API. */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Fetch daily views for a specific channel over the last 7 days (YouTube
 * Analytics API), using the tokens of the account that owns it. Returns one
 * point per day. Does not write to the DB.
 */
export async function getChannelAnalytics(
  accountId: string,
  youtubeChannelId: string
): Promise<AnalyticsPoint[]> {
  const accessToken = await getValidAccessTokenForAccount(accountId)

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const params = new URLSearchParams({
    ids: `channel==${youtubeChannelId}`,
    metrics: "views",
    dimensions: "day",
    sort: "day",
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
  })

  const url = `${REPORTS_URL}?${params.toString()}`
  const data = await ytFetch<YtAnalyticsResponse>(accessToken, url)

  return (data.rows ?? []).map((row) => ({
    date: String(row[0]),
    views: toNumber(row[1]),
  }))
}
