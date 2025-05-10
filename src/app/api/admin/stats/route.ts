import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"

// List of admin emails
const ADMIN_EMAILS = ["admin@example.com", "admin2@example.com"] // Replace with actual admin emails

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToMongoose()

    // Get total orders
    const totalOrders = await Order.countDocuments()

    // Get total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Get active rentals (orders with endDate >= today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeRentals = await Order.countDocuments({
      status: { $in: ["confirmed", "completed"] },
      endDate: { $gte: today },
    })

    // Get total customers
    const totalCustomers = await User.countDocuments()

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        activeRentals,
        totalCustomers,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 })
  }
}
