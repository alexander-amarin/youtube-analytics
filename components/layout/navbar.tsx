import { auth } from "@/auth"
import { GoogleSigninButton } from "@/components/auth/google-signin-button"
import { SignOutButton } from "@/components/auth/signout-button"

export async function Navbar() {
  const session = await auth()
  const user = session?.user

  const initial = (user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card px-6">
      <span className="text-lg font-semibold tracking-tight">YT Analytics</span>

      {user ? (
        <div className="flex items-center gap-3">
          {user.image ? (
            <div className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.image}
                alt={user.name ?? "User avatar"}
                referrerPolicy="no-referrer"
                className="block size-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground"
              aria-label="User avatar"
              role="img"
            >
              {initial}
            </div>
          )}
          <SignOutButton />
        </div>
      ) : (
        <GoogleSigninButton />
      )}
    </header>
  )
}
