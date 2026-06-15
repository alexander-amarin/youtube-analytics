import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

// The JWT interface is declared in `@auth/core/jwt` and only re-exported by
// `next-auth/jwt` via `export *`, so the augmentation must target the source
// module to merge correctly.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string
  }
}
