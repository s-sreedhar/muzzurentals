"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CalendarIcon, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface BlockedDate {
  id: string
  cameraId: string
  cameraName?: string
  startDate: string
  endDate: string
  reason?: string
  isFullDay: boolean
  timeSlot?: "morning" | "afternoon" | "evening"
  createdAt: string
  updatedAt: string
}

  const cameras = [
    { id: "canon-eos-77d", name: "Canon EOS 77D" },
    { id: "canon-eos-750d", name: "Canon EOS 750D" },
    { id: "canon-eos-1200d", name: "Canon EOS 1200D" }
  ]

export function BlockedDatesManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("canon-eos-77d")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [rentalType, setRentalType] = useState<"full-day" | "half-day">("full-day")
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon" | "evening" | "">("")
  const [reason, setReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hardcoded cameras data

  useEffect(() => {
    const fetchBlockedDates = async () => {
      if (!selectedCamera) {
        setBlockedDates([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/blocked-dates?cameraId=${selectedCamera}`)
        if (!response.ok) throw new Error("Failed to fetch blocked dates")
        
        const data = await response.json()
        if (data.success) {
          setBlockedDates(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlockedDates()
  }, [selectedCamera])

  const formatDateSafe = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const renderCalendarDay = (props: any) => {
    const date = props.date
    const dateString = date.toISOString().split('T')[0]

    const isBlocked = blockedDates.some((blockedDate) => {
      const start = new Date(blockedDate.startDate).toISOString().split('T')[0]
      const end = new Date(blockedDate.endDate).toISOString().split('T')[0]
      return dateString >= start && dateString <= end
    })

    return (
      <div className={`relative w-full h-full flex items-center justify-center ${
        isBlocked ? "bg-red-900/30 rounded-full" : ""
      }`}>
        {props.date.getDate()}
        {isBlocked && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
        )}
      </div>
    )
  }

  function getTimeSlotLabel(timeSlot: string) {
    switch (timeSlot) {
      case "morning":
        return "Morning"
      case "afternoon":
        return "Afternoon"
      case "evening":
        return "Evening"
      default:
        return "Unknown"
    }
  }

  async function handleDeleteBlockedDate(id: string) {
    if (!window.confirm("Are you sure you want to delete this blocked date?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete blocked date")

      setBlockedDates((prev) => prev.filter((date) => date.id !== id))
    } catch (error) {
      console.error("Error deleting blocked date:", error)
      alert("Failed to delete blocked date.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddBlockedDate() {
    if (!selectedCamera || !selectedDate) {
      alert("Please select a camera and date")
      return
    }

    if (rentalType === "half-day" && !timeSlot) {
      alert("Please select a time slot for half-day rental")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cameraId: selectedCamera,
          startDate: selectedDate,
          endDate: endDate || selectedDate,
          reason,
          isFullDay: rentalType === "full-day",
          timeSlot: rentalType === "half-day" ? timeSlot : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to add blocked date")

      const data = await response.json()
      if (data.success) {
        setBlockedDates((prev) => [...prev, data.data])
        setReason("")
        setSelectedDate(new Date())
        setEndDate(new Date())
        setRentalType("full-day")
        setTimeSlot("")
      }
    } catch (error) {
      console.error("Error adding blocked date:", error)
      alert("Failed to add blocked date")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
          <TabsTrigger value="calendar" className="text-white data-[state=active]:bg-purple-600">
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="text-white data-[state=active]:bg-purple-600">
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Blocked Dates Calendar</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage blocked dates for each camera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="camera">Camera</Label>
                    <Select
                      value={selectedCamera}
                      onValueChange={setSelectedCamera}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select a camera" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {cameras.map((camera) => (
                          <SelectItem key={camera.id} value={camera.id}>
                            {camera.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Rental Type</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={rentalType === "full-day" ? "default" : "outline"}
                        onClick={() => setRentalType("full-day")}
                        className="bg-gray-700 border-gray-600 text-white"
                      >
                        Full Day
                      </Button>
                      <Button
                        variant={rentalType === "half-day" ? "default" : "outline"}
                        onClick={() => setRentalType("half-day")}
                        className="bg-gray-700 border-gray-600 text-white"
                      >
                        Half Day
                      </Button>
                    </div>
                  </div>

                  {rentalType === "half-day" && (
                    <div className="space-y-2">
                      <Label>Time Slot</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={timeSlot === "morning" ? "default" : "outline"}
                          onClick={() => setTimeSlot("morning")}
                          className="bg-gray-700 border-gray-600 text-white"
                        >
                          Morning
                        </Button>
                        <Button
                          variant={timeSlot === "afternoon" ? "default" : "outline"}
                          onClick={() => setTimeSlot("afternoon")}
                          className="bg-gray-700 border-gray-600 text-white"
                        >
                          Afternoon
                        </Button>
                        <Button
                          variant={timeSlot === "evening" ? "default" : "outline"}
                          onClick={() => setTimeSlot("evening")}
                          className="bg-gray-700 border-gray-600 text-white"
                        >
                          Evening
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (optional)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Maintenance, repair, etc."
                    />
                  </div>

                  <Button
                    onClick={handleAddBlockedDate}
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Blocked Date"
                    )}
                  </Button>
                </div>

                <div className="md:col-span-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="bg-gray-700 text-white"
                        classNames={{
                          day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                          day_today: "bg-gray-700 text-white",
                        }}
                        components={{
                          DayContent: renderCalendarDay
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
  <Card className="bg-gray-800 border-gray-700 text-white">
    <CardHeader>
      <CardTitle>Blocked Dates List</CardTitle>
      <CardDescription className="text-gray-400">
        View and manage all blocked dates
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Filter by Camera</Label>
          <Select
            value={selectedCamera}
            onValueChange={(value) => {
              setSelectedCamera(value)
            }}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="All cameras" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {/* <SelectItem value="all">All cameras</SelectItem> */}
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={camera.id}>
                  {camera.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
                {isLoading ? (
                   <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                ) : blockedDates.length > 0 ? (
                  <div className="space-y-4">
            {blockedDates.map((blockedDate) => (
              <motion.div
                key={blockedDate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">
                                {formatDateSafe(blockedDate.startDate)}
                                {blockedDate.startDate !== blockedDate.endDate &&
                                  ` - ${formatDateSafe(blockedDate.endDate)}`}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  blockedDate.isFullDay
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500"
                                    : "bg-purple-500/20 text-purple-400 border-purple-500"
                                }
                              >
                                {blockedDate.isFullDay ? "Full Day" : "Half Day"}
                              </Badge>
                              {!blockedDate.isFullDay && blockedDate.timeSlot && (
                                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                                  {getTimeSlotLabel(blockedDate.timeSlot)}
                                </Badge>
                              )}
                            </div>
                            {blockedDate.reason && (
                              <p className="text-gray-300 text-sm">{blockedDate.reason}</p>
                            )}
                            {blockedDate.cameraName && (
                              <p className="text-gray-400 text-xs mt-1">
                                Camera: {blockedDate.cameraName}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            onClick={() => handleDeleteBlockedDate(blockedDate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No blocked dates found{selectedCamera ? " for this camera" : ""}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}