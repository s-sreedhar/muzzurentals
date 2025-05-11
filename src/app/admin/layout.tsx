import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

// List of admin emails
const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "admin2@example.com"] // Replace with actual admin emails

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/api/auth/signin?callbackUrl=/admin")
  }

  return <>{children}</>
}
