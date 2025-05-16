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
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface IncomeChartProps {
  period: "weekly" | "monthly"
}

// interface Camera {
//   id: string
//   name: string
// }

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
    borderWidth: number
  }[]
  comparisonLabel?: string
}

const cameras = [
    { id: "canon-eos-77d", name: "Canon EOS 77D" },
    { id: "canon-eos-750d", name: "Canon EOS 750D" },
    { id: "canon-eos-1200d", name: "Canon EOS 1200D" }
];

export function IncomeChart({ period }: IncomeChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<string>("all")
  // const [cameras, setCameras] = useState<Camera[]>([{ id: "all", name: "All Cameras" }])
  const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   const fetchCameras = async () => {
  //     try {
  //       const response = await fetch("/api/cameras")
  //       if (!response.ok) throw new Error("Failed to fetch cameras")
        
  //       const data = await response.json()
  //       if (data.success) {
  //         setCameras(prev => [...prev, ...data.cameras])
  //       }
  //     } catch (error) {
  //       console.error("Error fetching cameras:", error)
  //     }
  //   }

  //   fetchCameras()
  // }, [])

  useEffect(() => {
    const fetchIncomeData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const url = `/api/admin/income?period=${period}${
          selectedCamera !== "all" ? `&cameraId=${selectedCamera}` : ""
        }`
        
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch income data")
        }

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: period === "weekly" ? "Current Week" : "Current Month",
              data: data.currentPeriod,
              backgroundColor: "rgba(147, 51, 234, 0.7)",
              borderColor: "rgba(147, 51, 234, 1)",
              borderWidth: 1,
            },
            {
              label: period === "weekly" ? "Previous Week" : "Previous Month",
              data: data.previousPeriod,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
          ],
          comparisonLabel: data.comparisonLabel
        })
      } catch (error) {
        console.error(`Error fetching ${period} income data:`, error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
        setChartData(null)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchIncomeData()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [period, selectedCamera])

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff",
          font: {
            size: 12
          },
          padding: 20
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ₹${context.raw?.toLocaleString()}`
          }
        }
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
          callback: (value) => `₹${Number(value).toLocaleString()}`,
        },
        beginAtZero: true,
      },
    },
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>{period === "weekly" ? "Weekly" : "Monthly"} Income</CardTitle>
          <CardDescription className="text-gray-400">
            Loading comparison data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>{period === "weekly" ? "Weekly" : "Monthly"} Income</CardTitle>
          <CardDescription className="text-gray-400">
            Error loading data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex flex-col items-center justify-center space-y-2">
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
        <CardTitle>{period === "weekly" ? "Weekly" : "Monthly"} Income</CardTitle>
        <CardDescription className="text-gray-400">
          {chartData?.comparisonLabel || `Comparison of current and previous ${period} income`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <Label htmlFor="camera-filter" className="text-sm text-gray-400 mb-1 block">
                Filter by Camera
              </Label>
              <Select 
                value={selectedCamera} 
                onValueChange={setSelectedCamera}
                disabled={isLoading}
              >
                <SelectTrigger id="camera-filter" className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {cameras.map((camera) => (
                    <SelectItem 
                      key={camera.id} 
                      value={camera.id}
                      className="hover:bg-gray-700 focus:bg-gray-700"
                    >
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-80">
            {chartData ? (
              <Bar 
                data={chartData} 
                options={chartOptions}
                redraw={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}