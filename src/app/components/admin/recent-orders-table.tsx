"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  userName: string
  userEmail: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  itemCount: number
  firstItem: string
}

export function RecentOrdersTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/recent-orders")
        if (!response.ok) throw new Error("Failed to fetch orders")
        
        const data = await response.json()
        if (!data.success) throw new Error(data.message || "Data fetch failed")

        // Ensure createdAt is properly formatted
        const formattedOrders = data.data.map((order: any) => ({
          ...order,
          createdAt: order.createdAt || new Date().toISOString() // Fallback to current date if missing
        }))
        
        setOrders(formattedOrders || [])
      } catch (error) {
        console.error("Error fetching recent orders:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500"
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500"
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, HH:mm")
    } catch (e) {
      console.error("Invalid date format:", dateString)
      return "N/A"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-purple-500 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
          <tr>
            <th scope="col" className="px-4 py-3">Order</th>
            <th scope="col" className="px-4 py-3">Customer</th>
            <th scope="col" className="px-4 py-3">Items</th>
            <th scope="col" className="px-4 py-3">Amount</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Payment</th>
            <th scope="col" className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-4 py-3 font-mono text-xs">{order.id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.userName}</div>
                  <div className="text-xs text-gray-400">{order.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  {order.firstItem && (
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">
                      {order.firstItem}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">₹{order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                No recent orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}