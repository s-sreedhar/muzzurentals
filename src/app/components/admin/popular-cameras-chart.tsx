"use client"

import { useState, useEffect } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { Loader2 } from "lucide-react"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

export function PopularCamerasChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    // Fetch popular cameras data
    const fetchPopularCameras = async () => {
      try {
        const response = await fetch("/api/admin/popular-cameras")
        const data = await response.json()

        if (data.success) {
          // Format data for chart
          setChartData({
            labels: data.cameras.map((item: any) => item.name),
            datasets: [
              {
                data: data.cameras.map((item: any) => item.count),
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
        }
      } catch (error) {
        console.error("Error fetching popular cameras:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularCameras()
  }, [])

  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "white",
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="h-64">
      {chartData ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </div>
  )
}
