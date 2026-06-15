"use client"

import { useRouter } from "next/navigation"

type ChannelOption = {
  id: string
  title: string
}

export function ChannelSelector({
  channels,
  activeChannelId,
  basePath,
}: {
  channels: ChannelOption[]
  activeChannelId: string
  basePath: string
}) {
  const router = useRouter()

  return (
    <select
      value={activeChannelId}
      onChange={(event) => router.push(`${basePath}?channel=${event.target.value}`)}
      aria-label="Select channel"
      className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {channels.map((channel) => (
        <option key={channel.id} value={channel.id}>
          {channel.title}
        </option>
      ))}
    </select>
  )
}
