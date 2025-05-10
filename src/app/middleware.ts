import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
    })

    // Protected routes that require authentication
    const protectedPaths = ["/profile", "/cart/checkout"]

    const path = request.nextUrl.pathname

    // Check if the path is protected and user is not authenticated
    if (protectedPaths.some((prefix) => path.startsWith(prefix)) && !token) {
      const url = new URL("/auth/signin", request.url)
      url.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // Redirect to error page if there's an error
    return NextResponse.redirect(new URL("/api/auth/error", request.url))
  }
}

export const config = {
  matcher: ["/profile/:path*", "/cart/checkout/:path*", "/admin/:path*"],
}
