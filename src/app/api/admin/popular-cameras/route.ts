import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"

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

    // Get start of current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Aggregate orders to get popular cameras
    const popularCameras = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.cameraId",
          name: { $first: "$items.cameraName" },
          count: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 6,
      },
    ])

    return NextResponse.json({
      success: true,
      cameras: popularCameras,
    })
  } catch (error) {
    console.error("Error fetching popular cameras:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch popular cameras" }, { status: 500 })
  }
}
