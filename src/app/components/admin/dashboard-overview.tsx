"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeChart } from "@/components/admin/income-chart"
import { PopularCamerasChart } from "@/components/admin/popular-cameras-chart"
import { StatsCards } from "@/components/admin/stats-cards"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { Loader2 } from "lucide-react"

export function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeRentals: 0,
    totalCustomers: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()

        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] bg-gray-800">
          <TabsTrigger value="weekly">Weekly Income</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Income</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Weekly Income</CardTitle>
              <CardDescription className="text-gray-400">
                Comparison of current and previous week&apos; income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeChart period="weekly" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Monthly Income</CardTitle>
              <CardDescription className="text-gray-400">
                Comparison of current and previous month&apos;s income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeChart period="monthly" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Popular Cameras</CardTitle>
            <CardDescription className="text-gray-400">Most rented cameras this month</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularCamerasChart />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription className="text-gray-400">Latest 5 orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
