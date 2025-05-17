import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import mongoose from "mongoose"

// List of admin emails (move to environment variables in production)
const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "muzameelpatan123@gmail.com"]

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Strict admin authentication check
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" }, 
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))
  const status = searchParams.get("status") || "all"
  const search = searchParams.get("search")?.trim() || ""
  const fromDate = searchParams.get("fromDate")
  const toDate = searchParams.get("toDate")

  const skip = (page - 1) * limit

  try {
    await connectToMongoose()

    // Build query
    const query: mongoose.FilterQuery<any> = {}

    // Status filter
    if (status !== "all") {
      query.status = status
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {}
      if (fromDate) query.createdAt.$gte = new Date(fromDate)
      if (toDate) query.createdAt.$lte = new Date(toDate)
    }

    // Search filter
    if (search) {
      const isObjectId = mongoose.isValidObjectId(search)
      
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(search) }] : []),
        { "items.name": { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search.replace(/\D/g, ""), $options: "i" } }
      ]
    }

    // Get orders with pagination
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ])

    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch orders",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}