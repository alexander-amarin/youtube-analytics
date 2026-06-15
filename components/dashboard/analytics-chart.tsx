"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ViewsDatum = {
  day: string
  views: number
}

const DEFAULT_DATA: ViewsDatum[] = [
  { day: "Mon", views: 120000 },
  { day: "Tue", views: 180000 },
  { day: "Wed", views: 140000 },
  { day: "Thu", views: 210000 },
  { day: "Fri", views: 190000 },
  { day: "Sat", views: 250000 },
  { day: "Sun", views: 230000 },
]

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function AnalyticsChart({
  data = DEFAULT_DATA,
}: {
  data?: ViewsDatum[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Views Last 7 Days</CardTitle>
        <CardDescription>Daily views across all channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={44}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => compactFormatter.format(Number(value))}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
                formatter={(value) => [
                  compactFormatter.format(Number(value)),
                  "Views",
                ]}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
