import { Eye, Plus, Users, Video } from "lucide-react"
import { auth } from "@/auth"
import { syncChannels } from "@/services/youtube/sync-channels"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GoogleSigninButton } from "@/components/auth/google-signin-button"

export default async function ChannelsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Connect your YouTube account</CardTitle>
            <CardDescription>
              Sign in to manage connected channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GoogleSigninButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sync the user's channels from the YouTube API into the DB, then render
  // the persisted rows.
  const channels = await syncChannels(session.user.id)

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Connected Channels
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your connected YouTube channels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Connected channels */}
        {channels.map((channel) => {
          const initial = (channel.title || "C").charAt(0).toUpperCase()
          const subscribers = Number(channel.subscriberCount ?? 0)
          const views = Number(channel.viewCount ?? 0)
          const videos = channel.videoCount ?? 0

          return (
            <Card key={channel.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {channel.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      referrerPolicy="no-referrer"
                      className="size-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-medium text-accent-foreground">
                      {initial}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <CardTitle>{channel.title}</CardTitle>
                    <CardDescription>Connected via Google</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-8">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5" />
                    Subscribers
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
                    {subscribers.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Eye className="size-3.5" />
                    Views
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
                    {views.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Video className="size-3.5" />
                    Videos
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
                    {videos.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add channel placeholder */}
        <Card className="border-dashed">
          <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Plus className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Add Channel</span>
              <span className="text-sm text-muted-foreground">
                Connect another YouTube channel
              </span>
            </div>
            <Button asChild variant="outline">
              <a href="/api/connect/google">Add Channel</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
