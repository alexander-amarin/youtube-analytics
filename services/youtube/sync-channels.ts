import { prisma } from "@/lib/prisma"
import { getMyChannels } from "./channels"

/**
 * Fetch the authenticated user's YouTube channels and persist them to the
 * database, then return the stored rows.
 *
 * Each channel is upserted on the (userId, youtubeChannelId) unique key, so
 * repeated syncs update existing rows instead of creating duplicates. Large
 * counts are stored as BigInt; videoCount stays an Int.
 */
export async function syncChannels(userId: string) {
  // 1. Resolve all linked Google accounts (each provides its own tokens).
  const accounts = await prisma.account.findMany({
    where: { userId, provider: "google" },
  })

  if (accounts.length === 0) {
    throw new Error(`No Google account linked for user ${userId}`)
  }

  // 2. For each account, fetch its channels and upsert them.
  for (const account of accounts) {
    const channels = await getMyChannels(account.id)

    await Promise.all(
      channels.map((channel) =>
        prisma.channel.upsert({
          where: {
            userId_youtubeChannelId: {
              userId,
              youtubeChannelId: channel.youtubeChannelId,
            },
          },
          create: {
            userId,
            accountId: account.id,
            youtubeChannelId: channel.youtubeChannelId,
            title: channel.title,
            thumbnailUrl: channel.thumbnailUrl,
            subscriberCount: BigInt(channel.subscriberCount),
            viewCount: BigInt(channel.viewCount),
            videoCount: channel.videoCount,
          },
          update: {
            accountId: account.id,
            title: channel.title,
            thumbnailUrl: channel.thumbnailUrl,
            subscriberCount: BigInt(channel.subscriberCount),
            viewCount: BigInt(channel.viewCount),
            videoCount: channel.videoCount,
          },
        })
      )
    )
  }

  // 3. Return the persisted rows for this user.
  return prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })
}
