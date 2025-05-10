"use client"

import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface IncomeChartProps {
  period: "weekly" | "monthly"
}

export function IncomeChart({ period }: IncomeChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [selectedCamera, setSelectedCamera] = useState<string>("all")
  const [cameras, setCameras] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Fetch cameras for the filter
    const fetchCameras = async () => {
      try {
        const response = await fetch("/api/cameras")
        const data = await response.json()

        if (data.success) {
          setCameras([{ id: "all", name: "All Cameras" }, ...data.cameras])
        }
      } catch (error) {
        console.error("Error fetching cameras:", error)
      }
    }

    fetchCameras()
  }, [])

  useEffect(() => {
    // Fetch income data
    const fetchIncomeData = async () => {
      setIsLoading(true)
      try {
        const url = `/api/admin/income?period=${period}&cameraId=${selectedCamera !== "all" ? selectedCamera : ""}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          // Format data for chart
          const labels = data.labels
          const currentPeriodData = data.currentPeriod
          const previousPeriodData = data.previousPeriod

          setChartData({
            labels,
            datasets: [
              {
                label: period === "weekly" ? "Current Week" : "Current Month",
                data: currentPeriodData,
                backgroundColor: "rgba(147, 51, 234, 0.7)",
                borderColor: "rgba(147, 51, 234, 1)",
                borderWidth: 1,
              },
              {
                label: period === "weekly" ? "Previous Week" : "Previous Month",
                data: previousPeriodData,
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
              },
            ],
          })
        }
      } catch (error) {
        console.error(`Error fetching ${period} income data:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    if (cameras.length > 0) {
      fetchIncomeData()
    }
  }, [period, selectedCamera, cameras])

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
        ticks: {
          color: "rgba(209, 213, 219, 0.8)",
        },
      },
      y: {
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
        ticks: {
          color: "rgba(209, 213, 219, 0.8)",
        },
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
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-64">
          <Label htmlFor="camera-filter" className="text-sm text-gray-400 mb-1 block">
            Filter by Camera
          </Label>
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger id="camera-filter" className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select a camera" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={camera.id} className="hover:bg-gray-700">
                  {camera.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-80">
        {chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
