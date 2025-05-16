import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"
const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "admin2@example.com"]
export async function GET() {
  const session = await getServerSession(authOptions)

  // Admin check (replace with your admin verification logic)
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToMongoose()

    // Get all stats in parallel
    const [totalRevenueResult, totalOrders, activeRentals, totalCustomers] = await Promise.all([
      // Total Revenue (only from paid orders)
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            status: { $in: ["confirmed", "completed"] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ]),
      
      // Total Orders
      Order.countDocuments(),
      
      // Active Rentals (orders that are currently active)
      Order.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        status: "confirmed"
      }),
      
      // Total Customers
      User.countDocuments()
    ])

    const stats = {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalOrders,
      activeRentals,
      totalCustomers
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}