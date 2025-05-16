"use client"

import { motion } from "framer-motion"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsData {
  totalOrders: number
  totalRevenue: number
  activeRentals: number
  totalCustomers: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  if (!stats) {
    return <div className="text-gray-500 p-4">No stats available</div>
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "from-pink-500 to-rose-600",
    },
    {
      title: "Active Rentals",
      value: stats.activeRentals.toString(),
      icon: Package,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">{card.title}</h3>
                <div className={`p-2 rounded-full bg-gradient-to-br ${card.color} bg-opacity-20`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}