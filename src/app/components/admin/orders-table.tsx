"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, Download } from "lucide-react"
import { Label } from "@/components/ui/label"

interface Order {
  id: string
  userName: string
  userEmail: string
  total: number
  status: string
  paymentStatus: string
  rentalType: string
  startDate: string
  endDate: string
  createdAt: string
}

export function OrdersTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Fetch orders
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const url = `/api/admin/orders?page=${page}&status=${statusFilter}&search=${searchTerm}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setOrders(data.orders)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page, statusFilter, searchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/export-orders?status=${statusFilter}&search=${searchTerm}`)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`

      // Append to the document and trigger the download
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting orders:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 bg-gray-700 border-gray-600 text-white w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
            Search
          </Button>
        </form>

        <div className="flex items-center space-x-2">
          <div className="w-40">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all" className="hover:bg-gray-700">
                  All Statuses
                </SelectItem>
                <SelectItem value="pending" className="hover:bg-gray-700">
                  Pending
                </SelectItem>
                <SelectItem value="confirmed" className="hover:bg-gray-700">
                  Confirmed
                </SelectItem>
                <SelectItem value="completed" className="hover:bg-gray-700">
                  Completed
                </SelectItem>
                <SelectItem value="cancelled" className="hover:bg-gray-700">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase text-gray-400 bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Order ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Rental Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Start Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    End Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Payment
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium">{order.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{order.userName}</div>
                          <div className="text-xs text-gray-400">{order.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{order.rentalType.replace("-", " ")}</td>
                      <td className="px-4 py-3">{format(new Date(order.startDate), "MMM dd, yyyy")}</td>
                      <td className="px-4 py-3">{format(new Date(order.endDate), "MMM dd, yyyy")}</td>
                      <td className="px-4 py-3">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{format(new Date(order.createdAt), "MMM dd, yyyy")}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
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
