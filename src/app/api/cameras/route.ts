// /app/api/cameras/route.ts (Next.js 13+ app router)
import { NextResponse } from "next/server"
import { connectToMongoose } from "@/lib/mongodb"
import Camera from "@/models/Camera"

export async function GET() {
  try {
    await connectToMongoose()
    const cameras = await Camera.find()
    return NextResponse.json({ success: true, data: cameras })
  } catch (error) {
    console.error("Error fetching cameras:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cameras" }, { status: 500 })
  }
}
