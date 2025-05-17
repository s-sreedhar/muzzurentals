import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"

const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "muzameelpatan123@gmail.com"]

interface RecentOrder {
  id: string
  userName: string
  userEmail: string
  total: number
  status: string
  paymentStatus: string
  // createdAt: string
  itemCount: number
  firstItem: string
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin access required",
          code: "ADMIN_ACCESS_REQUIRED"
        },
        { status: 401 }
      )
    }

    // Connect to database
    await connectToMongoose()

    // Get recent orders with optimized query
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id userName userEmail total status paymentStatus createdAt items")
      .lean()
      .exec()

    // Transform data for client with proper typing
    const formattedOrders: RecentOrder[] = recentOrders.map(order => ({
      id: order._id.toString(),
      userName: order.userName || "Guest",
      userEmail: order.userEmail,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      // createdAt: order.createdAt.toISOString(),
      itemCount: order.items?.length || 0,
      firstItem: order.items?.[0]?.name || "N/A"
    }))

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      meta: {
        count: formattedOrders.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Admin recent orders error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent orders",
        error: error instanceof Error ? error.message : "Unknown error",
        code: "RECENT_ORDERS_FETCH_ERROR"
      },
      { status: 500 }
    )
  }
}