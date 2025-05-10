"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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
  timeSlot?: string
}

interface Camera {
  id: string
  name: string
}

export function BlockedDatesManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [cameras, setCameras] = useState<Camera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [rentalType, setRentalType] = useState<"full-day" | "half-day">("full-day")
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch cameras
    const fetchCameras = async () => {
      try {
        const response = await fetch("/api/cameras")
        const data = await response.json()

        if (data.success) {
          setCameras(data.cameras)
          if (data.cameras.length > 0) {
            setSelectedCamera(data.cameras[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching cameras:", error)
      }
    }

    fetchCameras()
  }, [])

  useEffect(() => {
    // Fetch blocked dates
    const fetchBlockedDates = async () => {
      if (!selectedCamera) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/blocked-dates?cameraId=${selectedCamera}`)
        const data = await response.json()

        if (data.success) {
          setBlockedDates(data.blockedDates)
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedCamera) {
      fetchBlockedDates()
    }
  }, [selectedCamera])

  const handleAddBlockedDate = async () => {
    if (!selectedCamera || !selectedDate) return

    setIsSubmitting(true)
    try {
      const payload = {
        cameraId: selectedCamera,
        startDate: selectedDate.toISOString(),
        endDate: endDate?.toISOString() || selectedDate.toISOString(),
        reason,
        isFullDay: rentalType === "full-day",
        timeSlot: rentalType === "half-day" ? timeSlot : undefined,
      }

      const response = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh blocked dates
        const refreshResponse = await fetch(`/api/admin/blocked-dates?cameraId=${selectedCamera}`)
        const refreshData = await refreshResponse.json()

        if (refreshData.success) {
          setBlockedDates(refreshData.blockedDates)
        }

        // Reset form
        setReason("")
        setTimeSlot("")
      }
    } catch (error) {
      console.error("Error adding blocked date:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Remove from state
        setBlockedDates((prev) => prev.filter((date) => date.id !== id))
      }
    } catch (error) {
      console.error("Error deleting blocked date:", error)
    }
  }

  const getTimeSlotLabel = (slot: string) => {
    switch (slot) {
      case "morning":
        return "Morning (8:00 AM - 12:00 PM)"
      case "afternoon":
        return "Afternoon (12:00 PM - 4:00 PM)"
      case "evening":
        return "Evening (4:00 PM - 8:00 PM)"
      default:
        return slot
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] bg-gray-800">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Blocked Dates Calendar</CardTitle>
              <CardDescription className="text-gray-400">View and manage blocked dates for each camera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="camera-select" className="text-sm text-gray-400 mb-1 block">
                      Select Camera
                    </Label>
                    <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                      <SelectTrigger id="camera-select" className="bg-gray-700 border-gray-600 text-white">
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

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-400">Rental Type</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={rentalType === "full-day" ? "default" : "outline"}
                        className={
                          rentalType === "full-day"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-gray-600 text-white hover:bg-gray-700"
                        }
                        onClick={() => setRentalType("full-day")}
                      >
                        Full Day
                      </Button>
                      <Button
                        type="button"
                        variant={rentalType === "half-day" ? "default" : "outline"}
                        className={
                          rentalType === "half-day"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-gray-600 text-white hover:bg-gray-700"
                        }
                        onClick={() => setRentalType("half-day")}
                      >
                        Half Day
                      </Button>
                    </div>
                  </div>

                  {rentalType === "half-day" && (
                    <div>
                      <Label htmlFor="time-slot" className="text-sm text-gray-400 mb-1 block">
                        Time Slot
                      </Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger id="time-slot" className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="morning" className="hover:bg-gray-700">
                            Morning (8:00 AM - 12:00 PM)
                          </SelectItem>
                          <SelectItem value="afternoon" className="hover:bg-gray-700">
                            Afternoon (12:00 PM - 4:00 PM)
                          </SelectItem>
                          <SelectItem value="evening" className="hover:bg-gray-700">
                            Evening (4:00 PM - 8:00 PM)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm text-gray-400 mb-1 block">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="start-date"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                            !selectedDate && "text-gray-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="bg-gray-800 text-white"
                          classNames={{
                            day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                            day_today: "bg-gray-700 text-white",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {rentalType === "full-day" && (
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm text-gray-400 mb-1 block">
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="end-date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                              !endDate && "text-gray-400",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) => date < (selectedDate || new Date())}
                            className="bg-gray-800 text-white"
                            classNames={{
                              day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                              day_today: "bg-gray-700 text-white",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm text-gray-400 mb-1 block">
                      Reason (Optional)
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for blocking"
                      className="bg-gray-700 border-gray-600 text-white"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleAddBlockedDate}
                    disabled={
                      isSubmitting ||
                      !selectedCamera ||
                      !selectedDate ||
                      (rentalType === "full-day" && !endDate) ||
                      (rentalType === "half-day" && !timeSlot)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
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
                          DayContent: (props) => {
                            const date = props.date
                            const dateString = date.toISOString().split("T")[0]

                            // Check if this date is blocked
                            const isBlocked = blockedDates.some((blockedDate) => {
                              const start = new Date(blockedDate.startDate).toISOString().split("T")[0]
                              const end = new Date(blockedDate.endDate).toISOString().split("T")[0]

                              // Check if date is within range
                              return dateString >= start && dateString <= end
                            })

                            return (
                              <div
                                className={`relative w-full h-full flex items-center justify-center ${
                                  isBlocked ? "bg-red-900/30 rounded-full" : ""
                                }`}
                              >
                                {props.date.getDate()}
                                {isBlocked && (
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                )}
                              </div>
                            )
                          },
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
              <CardDescription className="text-gray-400">View and manage all blocked dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="camera-select-list" className="text-sm text-gray-400 mb-1 block">
                    Select Camera
                  </Label>
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger id="camera-select-list" className="bg-gray-700 border-gray-600 text-white">
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
                                {format(new Date(blockedDate.startDate), "MMM dd, yyyy")}
                                {blockedDate.startDate !== blockedDate.endDate &&
                                  ` - ${format(new Date(blockedDate.endDate), "MMM dd, yyyy")}`}
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
                            {blockedDate.reason && <p className="text-gray-300 text-sm">{blockedDate.reason}</p>}
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
                  <div className="text-center py-8 text-gray-400">No blocked dates found for this camera</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
