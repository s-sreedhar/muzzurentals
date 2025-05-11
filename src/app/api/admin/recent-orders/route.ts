import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"

// List of admin emails
const ADMIN_EMAILS = ["admin@example.com", "admin2@example.com"] // Replace with actual admin emails

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
       console.log("Request is", request)
  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToMongoose()

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("id userName total status createdAt")

    return NextResponse.json({
      success: true,
      orders: recentOrders,
    })
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch recent orders" }, { status: 500 })
  }
}
