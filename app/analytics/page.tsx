import { Eye, Users, Video } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getChannelAnalytics } from "@/services/youtube/analytics"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { GoogleSigninButton } from "@/components/auth/google-signin-button"
import { ChannelSelector } from "@/components/channels/channel-selector"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Connect your YouTube account</CardTitle>
            <CardDescription>
              Sign in to view detailed channel analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GoogleSigninButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = session.user.id
  const channels = await prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })

  if (channels.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>No YouTube channel found</CardTitle>
            <CardDescription>
              This Google account does not have any YouTube channels.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Resolve the active channel from the ?channel= query param, else the first.
  const { channel: channelParam } = await searchParams
  const channel =
    channels.find((c) => c.id === channelParam) ?? channels[0]

  const analytics = await getChannelAnalytics(
    channel.accountId,
    channel.youtubeChannelId
  )

  // The chart expects { day, views }; the analytics service returns
  // { date, views }. Map the date into the chart's `day` axis key.
  const chartData = analytics.map((point) => ({
    day: point.date,
    views: point.views,
  }))

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Detailed channel performance insights
          </p>
        </div>
        <ChannelSelector
          channels={channels.map((c) => ({ id: c.id, title: c.title }))}
          activeChannelId={channel.id}
          basePath="/analytics"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Subscribers"
          value={Number(channel.subscriberCount ?? 0).toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Views"
          value={Number(channel.viewCount ?? 0).toLocaleString()}
          icon={Eye}
        />
        <StatCard
          title="Videos"
          value={(channel.videoCount ?? 0).toLocaleString()}
          icon={Video}
        />
      </div>

      <AnalyticsChart data={chartData} />
    </div>
  )
}
