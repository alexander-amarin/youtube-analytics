import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Comment } from "@/services/youtube/comments"

export function RecentComments({ comments }: { comments: Comment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
                  aria-hidden="true"
                >
                  {comment.authorName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {comment.authorName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {comment.text}
                  </span>
                  {comment.likeCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {comment.likeCount.toLocaleString()} likes
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
