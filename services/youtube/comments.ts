import { getValidAccessTokenForAccount } from "./tokens"
import { getMyVideos } from "./videos"
import { ytFetch, YouTubeApiError } from "./client"
import { toNumber } from "@/services/youtube/utils"

// --- Raw YouTube Data API v3 response shapes (commentThreads.list) ---

interface YtTopLevelCommentSnippet {
  authorDisplayName?: string
  textDisplay?: string
  textOriginal?: string
  likeCount?: number
}

interface YtCommentThread {
  id: string
  snippet?: {
    topLevelComment?: {
      snippet?: YtTopLevelCommentSnippet
    }
  }
}

interface YtCommentThreadsResponse {
  items?: YtCommentThread[]
}

// --- Domain object ---

export interface Comment {
  id: string
  authorName: string
  text: string
  likeCount: number
}

const MAX_RESULTS = 10

/**
 * Fetch up to 10 recent top-level comments on a video. When `videoId` is
 * omitted, falls back to the account's newest video. Returns normalized domain
 * objects. Does not write to the database.
 *
 * Pass `videoId` to skip the internal getMyVideos() lookup when the caller
 * already has the video (avoids a redundant chain of API calls).
 */
export async function getRecentComments(
  accountId: string,
  videoId?: string
): Promise<Comment[]> {
  // Resolve the target video: use the provided id, else the newest upload.
  let targetVideoId = videoId
  if (!targetVideoId) {
    const videos = await getMyVideos(accountId)
    targetVideoId = videos[0]?.id
  }
  if (!targetVideoId) {
    return []
  }

  const accessToken = await getValidAccessTokenForAccount(accountId)

  const url =
    "https://www.googleapis.com/youtube/v3/commentThreads" +
    `?part=snippet&maxResults=${MAX_RESULTS}` +
    `&videoId=${encodeURIComponent(targetVideoId)}`

  let data: YtCommentThreadsResponse
  try {
    data = await ytFetch<YtCommentThreadsResponse>(accessToken, url)
  } catch (error) {
    // A video with comments turned off returns 403 commentsDisabled; treat
    // that as simply having no comments rather than a hard failure.
    if (error instanceof YouTubeApiError && error.code === "commentsDisabled") {
      return []
    }
    throw error
  }

  return (data.items ?? []).map((thread) => {
    const snippet = thread.snippet?.topLevelComment?.snippet
    return {
      id: thread.id,
      authorName: snippet?.authorDisplayName ?? "",
      text: snippet?.textDisplay ?? snippet?.textOriginal ?? "",
      likeCount: toNumber(snippet?.likeCount),
    }
  })
}
