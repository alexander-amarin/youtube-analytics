import { getValidAccessTokenForAccount } from "./tokens"
import { getMyChannels } from "./channels"
import { ytFetch } from "./client"
import { toNumber } from "@/services/youtube/utils"

// --- Raw YouTube Data API v3 response shapes ---

interface YtThumbnail {
  url: string
  width?: number
  height?: number
}

interface YtPlaylistItem {
  snippet?: {
    resourceId?: {
      videoId?: string
    }
  }
}

interface YtPlaylistItemsResponse {
  items?: YtPlaylistItem[]
}

interface YtVideoSnippet {
  title: string
  thumbnails?: {
    default?: YtThumbnail
    medium?: YtThumbnail
    high?: YtThumbnail
  }
}

interface YtVideoStatistics {
  viewCount?: string
  likeCount?: string
}

interface YtVideo {
  id: string
  snippet?: YtVideoSnippet
  statistics?: YtVideoStatistics
}

interface YtVideosResponse {
  items?: YtVideo[]
}

// --- Domain object ---

export interface Video {
  id: string
  title: string
  thumbnailUrl: string | null
  viewCount: number
  likeCount: number
}

const MAX_RESULTS = 10

/**
 * Fetch the most recent uploads (up to 10) for a specific account's channel,
 * with per-video statistics. Returns normalized domain objects. Does not write
 * to the database.
 *
 * Pass `uploadsPlaylistId` to skip the internal getMyChannels() lookup when the
 * caller already has the channel (avoids a redundant API call).
 */
export async function getMyVideos(
  accountId: string,
  uploadsPlaylistId?: string | null
): Promise<Video[]> {
  const accessToken = await getValidAccessTokenForAccount(accountId)

  // Resolve the uploads playlist: use the provided id, else fetch the account's
  // first channel (callers should pass uploadsPlaylistId for a specific channel).
  let playlistId = uploadsPlaylistId ?? null
  if (!playlistId) {
    const channel = (await getMyChannels(accountId))[0]
    if (!channel?.uploadsPlaylistId) {
      throw new Error(`No uploads playlist found for account ${accountId}`)
    }
    playlistId = channel.uploadsPlaylistId
  }

  // 1. List the most recent items in the uploads playlist.
  const playlistUrl =
    "https://www.googleapis.com/youtube/v3/playlistItems" +
    `?part=snippet&maxResults=${MAX_RESULTS}` +
    `&playlistId=${encodeURIComponent(playlistId)}`

  const playlist = await ytFetch<YtPlaylistItemsResponse>(
    accessToken,
    playlistUrl
  )

  const videoIds = (playlist.items ?? [])
    .map((item) => item.snippet?.resourceId?.videoId)
    .filter((id): id is string => Boolean(id))

  // Empty playlist (or no resolvable ids) → nothing to fetch.
  if (videoIds.length === 0) {
    return []
  }

  // 2. Fetch snippet + statistics for those video ids.
  const videosUrl =
    "https://www.googleapis.com/youtube/v3/videos" +
    "?part=snippet,statistics" +
    `&id=${encodeURIComponent(videoIds.join(","))}`

  const videos = await ytFetch<YtVideosResponse>(accessToken, videosUrl)

  return (videos.items ?? []).map((video) => {
    const thumbnails = video.snippet?.thumbnails
    return {
      id: video.id,
      title: video.snippet?.title ?? "",
      thumbnailUrl:
        thumbnails?.high?.url ??
        thumbnails?.medium?.url ??
        thumbnails?.default?.url ??
        null,
      viewCount: toNumber(video.statistics?.viewCount),
      likeCount: toNumber(video.statistics?.likeCount),
    }
  })
}
