"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  _id: string
  userName: string
  userEmail: string
  total: number
  status: string
  paymentStatus: string
  rentalType: string
  startDate: string
  endDate: string
  createdAt: string
  items: OrderItem[]
}

export function OrdersTable() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1) // Reset to first page when search changes
    }, 500)

    return () => clearTimeout(timerId)
  }, [searchTerm])

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const url = `/api/admin/orders?page=${page}&status=${statusFilter}&search=${encodeURIComponent(debouncedSearchTerm)}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setOrders(data.data?.orders || [])
          setTotalPages(data.data?.pagination?.totalPages || 1)
        } else {
          console.error("Failed to fetch orders:", data.message)
          setOrders([])
          setTotalPages(1)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page, statusFilter, debouncedSearchTerm])

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

  // const handleViewOrder = (orderId: string) => {
  //   router.push(`/admin/orders/${orderId}`)
  // }

  // const handleExportCSV = async () => {
  //   try {
  //     const response = await fetch(
  //       `/api/admin/export-orders?status=${statusFilter}&search=${encodeURIComponent(debouncedSearchTerm)}`
  //     )
  //     if (!response.ok) throw new Error("Export failed")
      
  //     const blob = await response.blob()
  //     const url = window.URL.createObjectURL(blob)
  //     const a = document.createElement("a")
  //     a.href = url
  //     a.download = `orders_${format(new Date(), 'yyyyMMdd')}.csv`
  //     document.body.appendChild(a)
  //     a.click()
  //     document.body.removeChild(a)
  //     window.URL.revokeObjectURL(url)
  //   } catch (error) {
  //     console.error("Export error:", error)
  //     // Add toast notification here if needed
  //   }
  // }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            className="pl-9 bg-gray-800 border-gray-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="gap-2"
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            Export
          </Button> */}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3">Order ID</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Items</th>
                    <th scope="col" className="px-6 py-3">Period</th>
                    <th scope="col" className="px-6 py-3">Total</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Payment</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    {/* <th scope="col" className="px-6 py-3">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-mono text-sm">{order._id.slice(-8)}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{order.userName || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {order.items.slice(0, 2).map((item, i) => (
                              <div key={i} className="text-sm">
                                {item.name} × {item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{order.items.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {format(new Date(order.startDate), "MMM dd")} -{" "}
                            {format(new Date(order.endDate), "MMM dd")}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {order.rentalType.replace("-", " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </td>
                        {/* <td className="px-6 py-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewOrder(order._id)}
                            title="View order details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                        No orders found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-gray-400">
                Page {page} of {totalPages} • {orders.length} of {totalPages > 1 ? "many" : orders.length} orders
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}