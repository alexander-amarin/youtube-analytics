import { getValidAccessTokenForAccount } from "./tokens"
import { ytFetch } from "./client"
import { toNumber } from "@/services/youtube/utils"

// --- Raw YouTube Data API v3 response shapes (channels.list) ---

interface YtThumbnail {
  url: string
  width?: number
  height?: number
}

interface YtChannelSnippet {
  title: string
  description?: string
  thumbnails?: {
    default?: YtThumbnail
    medium?: YtThumbnail
    high?: YtThumbnail
  }
}

interface YtChannelStatistics {
  viewCount?: string
  subscriberCount?: string
  hiddenSubscriberCount?: boolean
  videoCount?: string
}

interface YtChannelContentDetails {
  relatedPlaylists?: {
    uploads?: string
    likes?: string
  }
}

interface YtChannel {
  id: string
  snippet?: YtChannelSnippet
  statistics?: YtChannelStatistics
  contentDetails?: YtChannelContentDetails
}

interface YtChannelListResponse {
  items?: YtChannel[]
}

// --- Domain object ---

export interface MyChannel {
  youtubeChannelId: string
  title: string
  thumbnailUrl: string | null
  subscriberCount: number
  viewCount: number
  videoCount: number
  uploadsPlaylistId: string | null
}

const CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels" +
  "?part=snippet,statistics,contentDetails&mine=true"

/**
 * Fetch all YouTube channels for a specific linked Account (Data API v3).
 * `channels.list(mine=true)` may return more than one channel (e.g. Brand
 * Accounts), so every item is mapped. Returns an empty array if the account
 * has no channels. Does not write to the database.
 */
export async function getMyChannels(accountId: string): Promise<MyChannel[]> {
  const accessToken = await getValidAccessTokenForAccount(accountId)
  const data = await ytFetch<YtChannelListResponse>(accessToken, CHANNELS_URL)

  return (data.items ?? []).map((channel) => {
    const { snippet, statistics, contentDetails } = channel
    const thumbnails = snippet?.thumbnails

    return {
      youtubeChannelId: channel.id,
      title: snippet?.title ?? "",
      thumbnailUrl:
        thumbnails?.high?.url ??
        thumbnails?.medium?.url ??
        thumbnails?.default?.url ??
        null,
      subscriberCount: toNumber(statistics?.subscriberCount),
      viewCount: toNumber(statistics?.viewCount),
      videoCount: toNumber(statistics?.videoCount),
      uploadsPlaylistId: contentDetails?.relatedPlaylists?.uploads ?? null,
    }
  })
}
