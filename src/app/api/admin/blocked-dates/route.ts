import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import BlockedDate from "@/models/BlockedDate"
import Camera from "@/models/Camera"

// List of admin emails
const ADMIN_EMAILS = ["admin@example.com", "admin2@example.com"] // Replace with actual admin emails

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

    // Get blocked dates with camera details
    const blockedDates = await BlockedDate.find({ cameraId }).sort({ startDate: 1 })

    // Get camera details
    const camera = await Camera.findOne({ id: cameraId })

    // Add camera name to blocked dates
    const blockedDatesWithCamera = blockedDates.map((date) => ({
      ...date.toObject(),
      cameraName: camera?.name || "Unknown Camera",
    }))

    return NextResponse.json({ success: true, blockedDates: blockedDatesWithCamera })
  } catch (error) {
    console.error("Error fetching blocked dates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch blocked dates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { cameraId, startDate, endDate, reason, isFullDay, timeSlot } = body

    if (!cameraId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Camera ID, start date, and end date are required" },
        { status: 400 },
      )
    }

    await connectToMongoose()

    // Create new blocked date
    const newBlockedDate = new BlockedDate({
      cameraId,
      startDate,
      endDate,
      reason,
      isFullDay,
      timeSlot,
    })

    await newBlockedDate.save()

    return NextResponse.json({ success: true, blockedDate: newBlockedDate })
  } catch (error) {
    console.error("Error creating blocked date:", error)
    return NextResponse.json({ success: false, message: "Failed to create blocked date" }, { status: 500 })
  }
}
