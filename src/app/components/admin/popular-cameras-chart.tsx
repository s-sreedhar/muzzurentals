"use client"

import { useState, useEffect } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

ChartJS.register(ArcElement, Tooltip, Legend)

interface CameraData {
  id: string
  name: string
  rentalsCount: number
  totalRevenue: number
}

export function PopularCamerasChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<{
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderColor: string[]
      borderWidth: number
    }[]
  } | null>(null)
  const [stats, setStats] = useState<{
    totalRentals: number
    totalRevenue: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularCameras = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/popular-cameras")
        if (!response.ok) throw new Error("Failed to fetch data")
        
        const data = await response.json()
        if (!data.success) throw new Error(data.message || "Data fetch failed")

        const cameras: CameraData[] = data.data.cameras
        
        setChartData({
          labels: cameras.map(item => item.name),
          datasets: [
            {
              data: cameras.map(item => item.rentalsCount),
              backgroundColor: [
                "rgba(147, 51, 234, 0.7)",
                "rgba(59, 130, 246, 0.7)",
                "rgba(236, 72, 153, 0.7)",
                "rgba(16, 185, 129, 0.7)",
                "rgba(245, 158, 11, 0.7)",
                "rgba(239, 68, 68, 0.7)",
              ],
              borderColor: [
                "rgba(147, 51, 234, 1)",
                "rgba(59, 130, 246, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(239, 68, 68, 1)",
              ],
              borderWidth: 1,
            },
          ],
        })

        setStats({
          totalRentals: data.data.stats.totalRentals,
          totalRevenue: data.data.stats.totalRevenue
        })

      } catch (error) {
        console.error("Error fetching popular cameras:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularCameras()
  }, [])

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#fff",
          font: {
            size: 12
          },
          padding: 20,
          boxWidth: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.raw as number
            const percentage = context.formattedValue
            return `${label}: ${value} rentals (${percentage})`
          }
        }
      },
    },
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Popular Cameras</CardTitle>
          <CardDescription className="text-gray-400">
            Loading camera rental data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Popular Cameras</CardTitle>
          <CardDescription className="text-gray-400">
            Error loading data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 space-y-2">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-purple-500 hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle>Popular Cameras</CardTitle>
        <CardDescription className="text-gray-400">
          {stats && `Total: ${stats.totalRentals} rentals ($${stats.totalRevenue.toLocaleString()})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {chartData ? (
            <Pie data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No camera data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}