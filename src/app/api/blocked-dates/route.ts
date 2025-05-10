import { type NextRequest, NextResponse } from "next/server"
import { connectToMongoose } from "@/lib/mongodb"
import BlockedDate from "@/models/BlockedDate"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cameraId = searchParams.get("cameraId")

  if (!cameraId) {
    return NextResponse.json({ success: false, message: "Camera ID is required" }, { status: 400 })
  }

  try {
    await connectToMongoose()

    const blockedDates = await BlockedDate.find({ cameraId }).sort({ startDate: 1 })

    return NextResponse.json({ success: true, blockedDates })
  } catch (error) {
    console.error("Error fetching blocked dates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch blocked dates" }, { status: 500 })
  }
}
