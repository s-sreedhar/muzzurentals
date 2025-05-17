import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import { startOfMonth } from "date-fns"

const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "muzameelpatan123@gmail.com"]

interface PopularCamera {
  id: string
  name: string
  image?: string
  rentalType?: string
  rentalsCount: number
  totalRevenue: number
  avgRevenuePerRental: number
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin privileges required",
          code: "ADMIN_ACCESS_REQUIRED"
        },
        { status: 401 }
      )
    }

    await connectToMongoose()

    const monthStart = startOfMonth(new Date())

    const popularCameras: PopularCamera[] = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $in: ["confirmed", "completed"] },
          paymentStatus: "paid"
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          rentalType: { $first: "$items.rentalType" },
          rentalsCount: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { rentalsCount: -1, totalRevenue: -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          image: 1,
          rentalType: 1,
          rentalsCount: 1,
          totalRevenue: 1,
          avgRevenuePerRental: { $divide: ["$totalRevenue", "$rentalsCount"] }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      data: {
        periodStart: monthStart.toISOString(),
        cameras: popularCameras,
        stats: {
          totalCamerasTracked: popularCameras.length,
          totalRentals: popularCameras.reduce((sum, c) => sum + c.rentalsCount, 0),
          totalRevenue: popularCameras.reduce((sum, c) => sum + c.totalRevenue, 0)
        }
      }
    })

  } catch (error) {
    console.error("Admin popular cameras error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch popular cameras data",
        error: error instanceof Error ? error.message : "Unknown error",
        code: "POPULAR_CAMERAS_FETCH_ERROR"
      },
      { status: 500 }
    )
  }
}