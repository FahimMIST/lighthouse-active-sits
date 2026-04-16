import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus } from "@/lib/clerk/helpers";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ isPaid: false });
  }
  // Read FRESH metadata from the Clerk API (not the JWT session claims,
  // which can lag by up to 60s after a webhook updates publicMetadata).
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;
  return NextResponse.json({ isPaid: isPaidStatus(meta) });
}
