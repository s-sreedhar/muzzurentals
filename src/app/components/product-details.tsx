"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Camera } from "@/lib/types"
import { useCart } from "@/lib/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, ChevronLeft, ShoppingCart, Clock, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, addDays, isBefore, isAfter, isSameDay } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductDetailsProps {
  camera: Camera
}

interface ReservedDate {
  _id: string
  cameraId: string
  startDate: string
  endDate: string
  isFullDay: boolean
  timeSlot?: "morning" | "afternoon" | "evening"
  fullDayType?: "9hrs" | "24hrs"
}

export function ProductDetails({ camera }: ProductDetailsProps) {
  const { cart, addToCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [isClient, setIsClient] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [rentalType, setRentalType] = useState<"half-day" | "full-day">("full-day")
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon" | "evening">("morning")
  const [fullDayType, setFullDayType] = useState<"9hrs" | "24hrs">("9hrs")
  const [addedToCart, setAddedToCart] = useState(false)
  const [reservedDates, setReservedDates] = useState<ReservedDate[]>([])
  const [accessories, setAccessories] = useState({
    tripod:false,
    longLens: false,
    extraBattery: false
  })

  useEffect(() => {
    setIsClient(true)
    const today = new Date()
    setStartDate(today)
    setEndDate(addDays(today, 1))
  }, [])

  useEffect(() => {
    if (!isClient) return

    const fetchReservedDates = async () => {
      try {
        const response = await fetch(`/api/reserved-dates?cameraId=${camera.id}`)
        const data = await response.json()
        if (data.success) {
          setReservedDates(data.reservedDates)
        }
      } catch (error) {
        console.error("Error fetching reserved dates:", error)
      }
    }

    fetchReservedDates()
  }, [camera.id, isClient])

  const handleAddToCart = () => {
    if (!startDate) {
      toast({
        title: "Date required",
        description: "Please select a start date for your rental.",
        variant: "destructive",
      })
      return
    }

    if (isDateReserved(startDate) || (rentalType === "full-day" && endDate && isDateRangeReserved(startDate, endDate))) {
      toast({
        title: "Date unavailable",
        description: "The selected date or date range is not available for rental.",
        variant: "destructive",
      })
      return
    }

    const cartItem = {
      id: camera.id,
      name: camera.name,
      image: camera.image,
      price:
        rentalType === "half-day"
          ? camera.pricing.halfDay
          : fullDayType === "9hrs"
          ? camera.pricing.fullDay9hrs
          : camera.pricing.fullDay24hrs,
      quantity: 1,
      rentalType,
      timeSlot: rentalType === "half-day" ? timeSlot : undefined,
      fullDayType: rentalType === "full-day" ? fullDayType : undefined,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString() || startDate.toISOString(),
      accessories: (accessories.tripod || accessories.longLens || accessories.extraBattery ) ? {
        tripod:accessories.tripod,
        longLens: accessories.longLens,
        extraBattery: accessories.extraBattery
      } : undefined
    }

    addToCart(cartItem)
    setAddedToCart(true)

    toast({
      title: "Added to cart",
      description: `${camera.name} has been added to your cart.`,
      variant: "success",
    })

    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  const isDateReserved = (date: Date): boolean => {
    if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
      return true
    }

    return reservedDates.some((reservedDate) => {
      const start = new Date(reservedDate.startDate)
      const end = new Date(reservedDate.endDate)
      
      if (!((isSameDay(date, start) || isAfter(date, start)) && 
          (isSameDay(date, end) || isBefore(date, end)))) {
        return false
      }

      if (reservedDate.isFullDay) {
        return true
      }

      if (rentalType === "half-day") {
        return reservedDate.timeSlot === timeSlot
      } else {
        return reservedDate.fullDayType === fullDayType
      }
    })
  }

  const isDateRangeReserved = (start: Date, end: Date): boolean => {
    const dates = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates.some((date) => isDateReserved(date))
  }

  const getReservedDateTooltip = (date: Date): string => {
    const matchingReservations = reservedDates.filter((reservedDate) => {
      const start = new Date(reservedDate.startDate)
      const end = new Date(reservedDate.endDate)
      return (isSameDay(date, start) || isAfter(date, start)) && (isSameDay(date, end) || isBefore(date, end))
    })

    if (matchingReservations.length === 0) return "Available"

    if (matchingReservations.some((reservation) => reservation.isFullDay)) {
      return "Fully reserved"
    }

    if (rentalType === "half-day") {
      const reservedSlots = matchingReservations
        .map((reservation) => reservation.timeSlot)
        .filter(Boolean) as string[]
      if (reservedSlots.includes(timeSlot)) {
        return `Reserved for ${timeSlot}`
      }
    } else {
      const reservedTypes = matchingReservations
        .map((reservation) => reservation.fullDayType)
        .filter(Boolean) as string[]
      if (reservedTypes.includes(fullDayType)) {
        return `Reserved for ${fullDayType}`
      }
    }

    return "Partially reserved"
  }

  const calculateTotalPrice = (): number => {
    let total = 0

    // Camera rental price
    if (!startDate) {
      total = fullDayType === "9hrs" ? camera.pricing.fullDay9hrs : camera.pricing.fullDay24hrs
    } else if (rentalType === "half-day") {
      total = camera.pricing.halfDay
    } else if (!endDate || isSameDay(startDate, endDate)) {
      total = fullDayType === "9hrs" ? camera.pricing.fullDay9hrs : camera.pricing.fullDay24hrs
    } else {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const dailyPrice = fullDayType === "9hrs" ? camera.pricing.fullDay9hrs : camera.pricing.fullDay24hrs
      total = dailyPrice * diffDays
    }

    // Add accessories if selected
    if (accessories.tripod) total+= 100
    if (accessories.longLens) total += 100
    if (accessories.extraBattery) total += 50

    return total
  }

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded-lg mb-2"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded-md"></div>
            ))}
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-700 rounded mb-6"></div>
          <div className="h-40 bg-gray-700 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Image gallery */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Link href="/" className="inline-flex items-center text-gray-300 mb-4 hover:text-white">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to cameras
        </Link>

        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-xl">
          <Image
            src={camera.image || "/placeholder.svg?height=400&width=600"}
            alt={camera.name}
            fill
            className="object-cover"
            priority
          />
          {camera.isNew && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
              New
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden border border-gray-700 shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={camera.image || "/placeholder.svg?height=100&width=100"}
                alt={`${camera.name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right side - Product details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center mb-2">
          <Badge variant="outline" className="font-normal border-purple-500 text-purple-400">
            {camera.category}
          </Badge>
          <Badge variant="outline" className="ml-2 font-normal border-blue-500 text-blue-400">
            {camera.brand}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {camera.name}
        </h1>

        <div className="flex items-baseline mb-6">
          <span className="text-3xl font-bold text-white">
            ₹{fullDayType === "9hrs" ? camera.pricing.fullDay9hrs : camera.pricing.fullDay24hrs}
          </span>
          <span className="text-gray-400 ml-1">/day</span>
          {rentalType === "half-day" && (
            <span className="ml-4 text-gray-400">(Half day: ₹{camera.pricing.halfDay})</span>
          )}
        </div>

        <Separator className="my-6 bg-gray-700" />

        <Tabs defaultValue="description" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4 bg-gray-800">
            <TabsTrigger value="description" className="data-[state=active]:bg-gray-700">
              Description
            </TabsTrigger>
            <TabsTrigger value="specs" className="data-[state=active]:bg-gray-700">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="includes" className="data-[state=active]:bg-gray-700">
              What&apos;s Included
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="text-gray-300">
            <p>{camera.description}</p>
          </TabsContent>

          <TabsContent value="specs">
            <ul className="space-y-2">
              {camera.specs.map((spec, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{spec}</span>
                </motion.li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="includes">
            <ul className="space-y-2">
              {camera.included.map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </motion.li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        <Separator className="my-6 bg-gray-700" />

        <Card className="bg-gray-800 border-gray-700 text-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <CardHeader>
            <CardTitle>Rental Options</CardTitle>
            <CardDescription className="text-gray-400">Choose your rental type and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Rental Type</h3>
                <RadioGroup
                  value={rentalType}
                  onValueChange={(value) => setRentalType(value as "half-day" | "full-day")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-day" id="full-day" className="border-purple-500 text-purple-500" />
                    <Label htmlFor="full-day" className="text-white">
                      Full Day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half-day" id="half-day" className="border-purple-500 text-purple-500" />
                    <Label htmlFor="half-day" className="text-white">
                      Half Day
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {rentalType === "full-day" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Full Day Type</h3>
                  <RadioGroup
                    value={fullDayType}
                    onValueChange={(value) => setFullDayType(value as "9hrs" | "24hrs")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="9hrs" id="9hrs" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="9hrs" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-blue-400" />
                        9 Hours (₹{camera.pricing.fullDay9hrs})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="24hrs" id="24hrs" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="24hrs" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-green-400" />
                        24 Hours (₹{camera.pricing.fullDay24hrs})
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {rentalType === "half-day" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Time Slot (₹{camera.pricing.halfDay})</h3>
                  <RadioGroup
                    value={timeSlot}
                    onValueChange={(value) => setTimeSlot(value as "morning" | "afternoon" | "evening")}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="morning" id="morning" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="morning" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                        Morning (8AM-12PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="afternoon" id="afternoon" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="afternoon" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-orange-400" />
                        Afternoon (12PM-4PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="evening" id="evening" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="evening" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-red-400" />
                        Evening (4PM-8PM)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Calendar Legend</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-purple-600 mr-2"></div>
                    <span className="text-sm text-gray-300">Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-900/30 mr-2"></div>
                    <span className="text-sm text-gray-300">Reserved</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-gray-700 mr-2"></div>
                    <span className="text-sm text-gray-300">Today</span>
                  </div>
                </div>
              </div>

              {rentalType === "half-day" ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Select Date</h3>
                  <TooltipProvider>
                    {startDate && (
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        className="rounded-md border border-gray-700 bg-gray-800 text-white"
                        disabled={(date) => isDateReserved(date)}
                        classNames={{
                          day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                          day_today: "bg-gray-700 text-white",
                        }}
                        components={{
                          DayContent: (props) => {
                            const isReserved = isDateReserved(props.date)

                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative w-full h-full flex items-center justify-center ${
                                      isReserved ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {props.date.getDate()}
                                    {isReserved && (
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {isReserved && (
                                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                    {getReservedDateTooltip(props.date)}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            )
                          },
                        }}
                      />
                    )}
                  </TooltipProvider>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Start Date</h3>
                    <TooltipProvider>
                      {startDate && (
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            if (!date) return
                            setStartDate(date)
                            if (endDate && isBefore(endDate, date)) {
                              setEndDate(date)
                            }
                          }}
                          className="rounded-md border border-gray-700 bg-gray-800 text-white"
                          disabled={(date) => isDateReserved(date)}
                          classNames={{
                            day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                            day_today: "bg-gray-700 text-white",
                          }}
                          components={{
                            DayContent: (props) => {
                              const isReserved = isDateReserved(props.date)

                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`relative w-full h-full flex items-center justify-center ${
                                        isReserved ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                      }`}
                                    >
                                      {props.date.getDate()}
                                      {isReserved && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  {isReserved && (
                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                      {getReservedDateTooltip(props.date)}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              )
                            },
                          }}
                        />
                      )}
                    </TooltipProvider>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">End Date</h3>
                    <TooltipProvider>
                      {startDate && endDate && (
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          className="rounded-md border border-gray-700 bg-gray-800 text-white"
                          disabled={(date) => isDateReserved(date) || (startDate ? isBefore(date, startDate) : false)}
                          classNames={{
                            day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                            day_today: "bg-gray-700 text-white",
                          }}
                          components={{
                            DayContent: (props) => {
                              const isReserved =
                                isDateReserved(props.date) || (startDate ? isBefore(props.date, startDate) : false)

                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`relative w-full h-full flex items-center justify-center ${
                                        isReserved ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                      }`}
                                    >
                                      {props.date.getDate()}
                                      {isReserved && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  {isReserved && (
                                    <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                      {startDate && isBefore(props.date, startDate)
                                        ? "Must be after start date"
                                        : getReservedDateTooltip(props.date)}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              )
                            },
                          }}
                        />
                      )}
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Accessories Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Optional Accessories</h3>
              <div className="space-y-3">
                    <div className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                  <Checkbox
                    id="longLens"
                    checked={accessories.tripod}
                    onCheckedChange={(checked) => 
                      setAccessories({...accessories, tripod: Boolean(checked)})
                    }
                    className="border-purple-500 data-[state=checked]:bg-purple-500"
                  />
                  <Label htmlFor="longLens" className="flex items-center justify-between w-full">
                    <span>Tripod</span>
                    <span className="text-gray-300">+₹100</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                  <Checkbox
                    id="longLens"
                    checked={accessories.longLens}
                    onCheckedChange={(checked) => 
                      setAccessories({...accessories, longLens: Boolean(checked)})
                    }
                    className="border-purple-500 data-[state=checked]:bg-purple-500"
                  />
                  <Label htmlFor="longLens" className="flex items-center justify-between w-full">
                    <span>Long Lens</span>
                    <span className="text-gray-300">+₹100</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                  <Checkbox
                    id="extraBattery"
                    checked={accessories.extraBattery}
                    onCheckedChange={(checked) => 
                      setAccessories({...accessories, extraBattery: Boolean(checked)})
                    }
                    className="border-purple-500 data-[state=checked]:bg-purple-500"
                  />
                  <Label htmlFor="extraBattery" className="flex items-center justify-between w-full">
                    <span>Extra Battery</span>
                    <span className="text-gray-300">+₹50</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Rental Type:</span>
                <span className="font-medium">
                  {rentalType === "full-day" 
                    ? `Full Day (${fullDayType})` 
                    : `Half Day (${timeSlot})`}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Base Price:</span>
                <span className="font-medium">
                  ₹{rentalType === "half-day" 
                    ? camera.pricing.halfDay 
                    : fullDayType === "9hrs" 
                      ? camera.pricing.fullDay9hrs 
                      : camera.pricing.fullDay24hrs}
                </span>
              </div>
              {accessories.tripod && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Tripod:</span>
                  <span className="font-medium">+₹100</span>
                </div>
              )}
              {accessories.longLens && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Long Lens:</span>
                  <span className="font-medium">+₹100</span>
                </div>
              )}
              {accessories.extraBattery && (
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Extra Battery:</span>
                  <span className="font-medium">+₹150</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-600">
                <span>Total:</span>
                <span className="text-purple-400">₹{calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            {!camera.available && (
              <div className="flex items-center p-3 bg-red-900/20 border border-red-800 rounded-md text-red-300">
                <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
                This camera is currently unavailable for rental
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-col w-full space-y-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={handleAddToCart}
                  disabled={
                    !camera.available ||
                    addedToCart ||
                    !startDate ||
                    isDateReserved(startDate) ||
                    (rentalType === "full-day" && endDate && isDateRangeReserved(startDate, endDate))
                  }
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={() => router.push('/cart/checkout')}
                  disabled={cart.length === 0}
                >
                  <ArrowRight className="mr-2 h-4 w-4" /> Proceed to Checkout
                </Button>
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}