// app/api/admin/blocked-dates/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import BlockedDate from "@/models/BlockedDate"
import Camera from "@/models/Camera"

const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com", "muzameelpatan123@gmail.com"]

// Helper to validate camera exists
async function validateCamera(cameraId: string) {
  const camera = await Camera.findOne({ id: cameraId }).lean()
  if (!camera) {
    throw new Error(`Camera with ID ${cameraId} not found`)
  }
  return camera
}

// GET all blocked dates (optionally filtered by cameraId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectToMongoose()
    const { searchParams } = new URL(request.url)
    const cameraId = searchParams.get("cameraId")

    // Build query
    const query: any = {}
    if (cameraId) {
      await validateCamera(cameraId)
      query.cameraId = cameraId
    }

    // Get blocked dates with camera names
    const blockedDates = await BlockedDate.find(query)
      .sort({ startDate: 1 })
      .lean()

    // Get all unique camera IDs
    const cameraIds = [...new Set(blockedDates.map(bd => bd.cameraId))]
    const cameras = await Camera.find({ id: { $in: cameraIds } }).lean()
    const cameraMap = new Map(cameras.map(c => [c.id, c.name]))

    // Format response
    const formattedDates = blockedDates.map(date => ({
      id: date._id.toString(),
      cameraId: date.cameraId,
      cameraName: cameraMap.get(date.cameraId) || "Unknown Camera",
      startDate: date.startDate.toISOString(),
      endDate: date.endDate.toISOString(),
      reason: date.reason,
      isFullDay: date.isFullDay,
      timeSlot: date.timeSlot,
      createdAt: date.createdAt.toISOString(),
      updatedAt: date.updatedAt.toISOString()
    }))

    return NextResponse.json({ success: true, data: formattedDates })

  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch blocked dates"
      },
      { status: 500 }
    )
  }
}

// Create new blocked date
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    await connectToMongoose()

    // Validate required fields
    if (!body.cameraId || !body.startDate) {
      return NextResponse.json(
        { success: false, message: "Camera ID and start date are required" },
        { status: 400 }
      )
    }

    // Verify camera exists
    await validateCamera(body.cameraId)

    // Create new blocked date
    const newBlockedDate = await BlockedDate.create({
      cameraId: body.cameraId,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
      reason: body.reason,
      isFullDay: body.isFullDay !== false, // default true
      timeSlot: body.isFullDay ? undefined : body.timeSlot
    })

    // Get camera name for response
    const camera = await Camera.findOne({ id: body.cameraId }).lean()

    return NextResponse.json({
      success: true,
      data: {
        id: newBlockedDate._id.toString(),
        cameraId: newBlockedDate.cameraId,
        cameraName: camera?.name || "Unknown Camera",
        startDate: newBlockedDate.startDate.toISOString(),
        endDate: newBlockedDate.endDate.toISOString(),
        reason: newBlockedDate.reason,
        isFullDay: newBlockedDate.isFullDay,
        timeSlot: newBlockedDate.timeSlot,
        createdAt: newBlockedDate.createdAt.toISOString(),
        updatedAt: newBlockedDate.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create blocked date"
      },
      { status: 500 }
    )
  }
}

// Delete blocked date
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectToMongoose()
    const { id } = params

    const deletedDate = await BlockedDate.findByIdAndDelete(id)
    if (!deletedDate) {
      return NextResponse.json(
        { success: false, message: "Blocked date not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blocked date deleted successfully"
    })

  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete blocked date"
      },
      { status: 500 }
    )
  }
}