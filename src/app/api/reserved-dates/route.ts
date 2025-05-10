import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import ReservedDate from "@/models/ReservedDate"
import Camera from "@/models/Camera"
import { authOptions } from "@/app/lib/auth"
// List of admin emails
const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "admin2@example.com"] // Replace with actual admin emails

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const cameraId = searchParams.get("cameraId")

  if (!cameraId) {
    return NextResponse.json({ success: false, message: "Camera ID is required" }, { status: 400 })
  }

  try {
    await connectToMongoose()

    // Get reserved dates with camera details
    const reservedDates = await ReservedDate.find({ cameraId }).sort({ startDate: 1 })

    // Get camera details
    const camera = await Camera.findOne({ id: cameraId })

    // Add camera name to reserved dates
    const reservedDatesWithCamera = reservedDates.map((date) => ({
      ...date.toObject(),
      cameraName: camera?.name || "Unknown Camera",
    }))

    return NextResponse.json({ success: true, reservedDates: reservedDatesWithCamera })
  } catch (error) {
    console.error("Error fetching reserved dates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reserved dates" }, { status: 500 })
  }
}
