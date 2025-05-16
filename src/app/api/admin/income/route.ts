import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  eachDayOfInterval,
  eachWeekOfInterval
} from "date-fns"

const ADMIN_EMAILS = ["s.sreedhargoud@gmail.com"]

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" }, 
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "weekly"
  const cameraId = searchParams.get("cameraId") || undefined

  try {
    await connectToMongoose()

    let labels: string[] = []
    let currentPeriodData: number[] = []
    let previousPeriodData: number[] = []
    let comparisonLabel = ""

    if (period === "weekly") {
      // Current week
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

      // Previous week
      const previousWeekStart = subWeeks(currentWeekStart, 1)
      const previousWeekEnd = subWeeks(currentWeekEnd, 1)

      // Generate labels for days of the week
      labels = eachDayOfInterval({
        start: currentWeekStart,
        end: currentWeekEnd
      }).map(day => format(day, "EEE"))

      comparisonLabel = `Week over Week (${format(previousWeekStart, 'MMM dd')} - ${format(previousWeekEnd, 'MMM dd')})`

      // Get data in parallel
      const [currentPeriod, previousPeriod] = await Promise.all([
        getDailyIncome(currentWeekStart, currentWeekEnd, cameraId),
        getDailyIncome(previousWeekStart, previousWeekEnd, cameraId)
      ])
      currentPeriodData = currentPeriod
      previousPeriodData = previousPeriod
    } else if (period === "monthly") {
      // Current month
      const currentMonthStart = startOfMonth(new Date())
      const currentMonthEnd = endOfMonth(new Date())

      // Previous month
      const previousMonthStart = subMonths(currentMonthStart, 1)
      const previousMonthEnd = subMonths(currentMonthEnd, 1)

      // Generate labels for weeks of the month
      const weeks = eachWeekOfInterval(
        { start: currentMonthStart, end: currentMonthEnd },
        { weekStartsOn: 1 }
      )
      labels = weeks.map((_, index) => `Week ${index + 1}`)

      comparisonLabel = `Month over Month (${format(previousMonthStart, 'MMM yyyy')})`
      const [currentPeriod, previousPeriod] = await Promise.all([
        getWeeklyIncome(currentMonthStart, currentMonthEnd, cameraId),
        getWeeklyIncome(previousMonthStart, previousMonthEnd, cameraId)
      ])
      currentPeriodData = currentPeriod
      previousPeriodData = previousPeriod
        getWeeklyIncome(previousMonthStart, previousMonthEnd, cameraId)
    }

    return NextResponse.json({
      success: true,
      labels,
      currentPeriod: currentPeriodData,
      previousPeriod: previousPeriodData,
      comparisonLabel,
      period
    })
  } catch (error) {
    console.error(`Error fetching ${period} income:`, error)
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to fetch ${period} income`,
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

async function getDailyIncome(startDate: Date, endDate: Date, cameraId?: string) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  const dailyIncomePromises = days.map(async (day) => {
    const nextDay = addDays(day, 1)
    
    const match: any = {
      createdAt: { $gte: day, $lt: nextDay },
      paymentStatus: "paid",
      status: { $in: ["confirmed", "completed"] }
    }

    if (cameraId) {
      match["items.productId"] = cameraId
    }

    const result = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])

    return result[0]?.total || 0
  })

  return Promise.all(dailyIncomePromises)
}

async function getWeeklyIncome(startDate: Date, endDate: Date, cameraId?: string) {
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 }
  )
  
  const weeklyIncomePromises = weeks.map(async (weekStart, i) => {
    const weekEnd = i < weeks.length - 1 ? weeks[i + 1] : endDate
    
    const match: any = {
      createdAt: { $gte: weekStart, $lt: weekEnd },
      paymentStatus: "paid",
      status: { $in: ["confirmed", "completed"] }
    }

    if (cameraId) {
      match["items.productId"] = cameraId
    }

    const result = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])

    return result[0]?.total || 0
  })

  return Promise.all(weeklyIncomePromises)
}