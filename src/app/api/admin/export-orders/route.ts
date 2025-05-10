import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import { format } from "date-fns"

// List of admin emails
const ADMIN_EMAILS = ["admin@example.com", "admin2@example.com"] // Replace with actual admin emails

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status") || "all"
  const search = searchParams.get("search") || ""

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
    const orders = await Order.find(query).sort({ createdAt: -1 })

    // Generate CSV
    const csvHeader =
      "Order ID,Customer Name,Customer Email,Rental Type,Start Date,End Date,Total,Status,Payment Status,Created At\n"

    const csvRows = orders
      .map((order) => {
        return `"${order.id}","${order.userName}","${order.userEmail}","${order.rentalType}","${format(new Date(order.startDate), "yyyy-MM-dd")}","${format(new Date(order.endDate), "yyyy-MM-dd")}","${order.total.toFixed(2)}","${order.status}","${order.paymentStatus}","${format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}"`
      })
      .join("\n")

    const csv = csvHeader + csvRows

    // Return CSV as a blob
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting orders:", error)
    return NextResponse.json({ success: false, message: "Failed to export orders" }, { status: 500 })
  }
}
