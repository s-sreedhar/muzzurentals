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

  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || "all"
  const search = searchParams.get("search") || ""

  const skip = (page - 1) * limit

  try {
    await connectToMongoose()

    // Build query
    const query: any = {}

    // Add status filter
    if (status !== "all") {
      query.status = status
    }

    // Add search filter
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
      ]
    }

    // Get orders
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query)
    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      success: true,
      orders,
      totalPages,
      currentPage: page,
      totalOrders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 })
  }
}
