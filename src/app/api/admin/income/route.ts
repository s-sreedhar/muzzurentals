import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import { startOfWeek, endOfWeek, subWeeks, format, addDays, startOfMonth, endOfMonth, subMonths } from "date-fns"

// List of admin emails
const ADMIN_EMAILS = ["admin@example.com", "admin2@example.com"] // Replace with actual admin emails

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  if (!session || !session.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "weekly"
  const cameraId = searchParams.get("cameraId") || null

  try {
    await connectToMongoose()

    let labels: string[] = []
    let currentPeriodData: number[] = []
    let previousPeriodData: number[] = []

    if (period === "weekly") {
      // Current week
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }) // Sunday

      // Previous week
      const previousWeekStart = subWeeks(currentWeekStart, 1)
      const previousWeekEnd = subWeeks(currentWeekEnd, 1)

      // Generate labels for days of the week
      labels = Array.from({ length: 7 }, (_, i) => {
        const day = addDays(currentWeekStart, i)
        return format(day, "EEE")
      })

      // Get current week data
      currentPeriodData = await getDailyIncome(currentWeekStart, 7, cameraId)

      // Get previous week data
      previousPeriodData = await getDailyIncome(previousWeekStart, 7, cameraId)
    } else if (period === "monthly") {
      // Current month
      const currentMonthStart = startOfMonth(new Date())
      const currentMonthEnd = endOfMonth(new Date())
      const daysInMonth = currentMonthEnd.getDate()

      // Previous month
      const previousMonthStart = startOfMonth(subMonths(new Date(), 1))
      const previousMonthEnd = endOfMonth(subMonths(new Date(), 1))
      const daysInPreviousMonth = previousMonthEnd.getDate()

      // Generate labels for weeks of the month
      labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]

      // Get current month data by week
      currentPeriodData = await getWeeklyIncome(currentMonthStart, Math.ceil(daysInMonth / 7), cameraId)

      // Get previous month data by week
      previousPeriodData = await getWeeklyIncome(previousMonthStart, Math.ceil(daysInPreviousMonth / 7), cameraId)
    }

    return NextResponse.json({
      success: true,
      labels,
      currentPeriod: currentPeriodData,
      previousPeriod: previousPeriodData,
    })
  } catch (error) {
    console.error(`Error fetching ${period} income:`, error)
    return NextResponse.json({ success: false, message: `Failed to fetch ${period} income` }, { status: 500 })
  }
}

// Helper function to get daily income
async function getDailyIncome(startDate: Date, days: number, cameraId: string | null) {
  const dailyIncome = []

  for (let i = 0; i < days; i++) {
    const day = addDays(startDate, i)
    const nextDay = addDays(day, 1)

    const match: any = {
      createdAt: {
        $gte: day,
        $lt: nextDay,
      },
      status: { $in: ["confirmed", "completed"] },
    }

    // Add camera filter if provided
    if (cameraId) {
      match["items.cameraId"] = cameraId
    }

    const result = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    dailyIncome.push(result.length > 0 ? result[0].total : 0)
  }

  return dailyIncome
}

// Helper function to get weekly income
async function getWeeklyIncome(startDate: Date, weeks: number, cameraId: string | null) {
  const weeklyIncome = []

  for (let i = 0; i < weeks; i++) {
    const weekStart = addDays(startDate, i * 7)
    const weekEnd = addDays(weekStart, 7)

    const match: any = {
      createdAt: {
        $gte: weekStart,
        $lt: weekEnd,
      },
      status: { $in: ["confirmed", "completed"] },
    }

    // Add camera filter if provided
    if (cameraId) {
      match["items.cameraId"] = cameraId
    }

    const result = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    weeklyIncome.push(result.length > 0 ? result[0].total : 0)
  }

  return weeklyIncome
}
