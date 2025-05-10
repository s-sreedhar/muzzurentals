"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
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
import { Check, ChevronLeft, ShoppingCart, Star, Clock, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, addDays, isBefore, isAfter, isSameDay } from "date-fns"

interface ProductDetailsProps {
  camera: Camera
}

export function ProductDetails({ camera }: ProductDetailsProps) {
  const { addToCart,cart } = useCart()
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [rentalType, setRentalType] = useState<"half-day" | "full-day">("full-day")
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon" | "evening">("morning")
  const [addedToCart, setAddedToCart] = useState(false)
  const [blockedDates, setBlockedDates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleCheckout = () => {
    router.push("/cart/checkout")
  }

  useEffect(() => {
    // Fetch blocked dates for this camera
    const fetchBlockedDates = async () => {
      try {
        const response = await fetch(`/api/blocked-dates?cameraId=${camera.id}`)
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

    fetchBlockedDates()
  }, [camera.id])

  const handleAddToCart = () => {
    // Create cart item with rental details
    const cartItem = {
      id: camera.id,
      quantity: 1,
      rentalType,
      timeSlot: rentalType === "half-day" ? timeSlot : undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
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

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    // Check if date is in the past
    if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
      return true
    }

    // For full-day rentals, check if the date is fully blocked
    if (rentalType === "full-day") {
      return blockedDates.some((blockedDate) => {
        const start = new Date(blockedDate.startDate)
        const end = new Date(blockedDate.endDate)
        return (
          (isSameDay(date, start) || isAfter(date, start)) &&
          (isSameDay(date, end) || isBefore(date, end)) &&
          blockedDate.isFullDay
        )
      })
    }

    // For half-day rentals, check if the specific time slot is blocked
    return blockedDates.some((blockedDate) => {
      const start = new Date(blockedDate.startDate)
      const end = new Date(blockedDate.endDate)

      if ((isSameDay(date, start) || isAfter(date, start)) && (isSameDay(date, end) || isBefore(date, end))) {
        // If it's a full-day block, the date is blocked
        if (blockedDate.isFullDay) {
          return true
        }

        // If it's a half-day block, check if the time slot matches
        return blockedDate.timeSlot === timeSlot
      }

      return false
    })
  }

  // Get tooltip content for a blocked date
  const getBlockedDateTooltip = (date: Date) => {
    const matchingBlocks = blockedDates.filter((blockedDate) => {
      const start = new Date(blockedDate.startDate)
      const end = new Date(blockedDate.endDate)
      return (isSameDay(date, start) || isAfter(date, start)) && (isSameDay(date, end) || isBefore(date, end))
    })

    if (matchingBlocks.length === 0) {
      return "Not available"
    }

    if (matchingBlocks.some((block) => block.isFullDay)) {
      return "Fully booked"
    }

    const blockedSlots = matchingBlocks.map((block) => block.timeSlot)
    if (blockedSlots.length === 3) {
      return "Fully booked"
    }

    return `Booked for: ${blockedSlots.join(", ")}`
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!startDate) return camera.pricePerDay

    if (rentalType === "half-day") {
      return camera.pricePerDay * 0.6 // 60% of full day price for half-day
    }

    if (!endDate || isSameDay(startDate, endDate)) {
      return camera.pricePerDay
    }

    // Calculate days between start and end date
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return camera.pricePerDay * diffDays
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <a href="/" className="inline-flex items-center text-gray-300 mb-4 hover:text-white">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to cameras
        </a>

        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-xl">
          <Image src={camera.image || "/placeholder.svg"} alt={camera.name} fill className="object-cover" priority />
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
                src={camera.image || "/placeholder.svg"}
                alt={`${camera.name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

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

        {/* <div className="flex items-center mt-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < camera.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-400">{camera.reviews} reviews</span>
        </div> */}

        <div className="flex items-baseline mb-6">
          <span className="text-3xl font-bold text-white">₹{camera.pricePerDay}</span>
          <span className="text-gray-400 ml-1">/day</span>
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
              What's Included
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

              {rentalType === "half-day" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Time Slot</h3>
                  <RadioGroup
                    value={timeSlot}
                    onValueChange={(value) => setTimeSlot(value as "morning" | "afternoon" | "evening")}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="morning" id="morning" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="morning" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                        Morning (8:00 AM - 12:00 PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="afternoon" id="afternoon" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="afternoon" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-blue-400" />
                        Afternoon (12:00 PM - 4:00 PM)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-md border border-gray-700">
                      <RadioGroupItem value="evening" id="evening" className="border-purple-500 text-purple-500" />
                      <Label htmlFor="evening" className="flex items-center text-white">
                        <Clock className="h-4 w-4 mr-2 text-orange-400" />
                        Evening (4:00 PM - 8:00 PM)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {rentalType === "half-day" ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Select Date</h3>
                  <TooltipProvider>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="rounded-md border border-gray-700 bg-gray-800 text-white"
                      disabled={(date) => isDateBlocked(date)}
                      classNames={{
                        day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                        day_today: "bg-gray-700 text-white",
                      }}
                      components={{
                        DayContent: (props) => {
                          const isBlocked = isDateBlocked(props.date)

                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`relative w-full h-full flex items-center justify-center ${
                                    isBlocked ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                  }`}
                                >
                                  {props.date.getDate()}
                                  {isBlocked && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {isBlocked && (
                                <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                  {getBlockedDateTooltip(props.date)}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          )
                        },
                      }}
                    />
                  </TooltipProvider>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Start Date</h3>
                    <TooltipProvider>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date)
                          // If end date is before new start date, update it
                          if (endDate && date && isBefore(endDate, date)) {
                            setEndDate(date)
                          }
                        }}
                        className="rounded-md border border-gray-700 bg-gray-800 text-white"
                        disabled={(date) => isDateBlocked(date)}
                        classNames={{
                          day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                          day_today: "bg-gray-700 text-white",
                        }}
                        components={{
                          DayContent: (props) => {
                            const isBlocked = isDateBlocked(props.date)

                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative w-full h-full flex items-center justify-center ${
                                      isBlocked ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {props.date.getDate()}
                                    {isBlocked && (
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {isBlocked && (
                                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                    {getBlockedDateTooltip(props.date)}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            )
                          },
                        }}
                      />
                    </TooltipProvider>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">End Date</h3>
                    <TooltipProvider>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        className="rounded-md border border-gray-700 bg-gray-800 text-white"
                        disabled={(date) => isDateBlocked(date) || (startDate ? isBefore(date, startDate) : false)}
                        classNames={{
                          day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                          day_today: "bg-gray-700 text-white",
                        }}
                        components={{
                          DayContent: (props) => {
                            const isBlocked =
                              isDateBlocked(props.date) || (startDate ? isBefore(props.date, startDate) : false)

                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative w-full h-full flex items-center justify-center ${
                                      isBlocked ? "bg-red-900/30 rounded-full cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {props.date.getDate()}
                                    {isBlocked && (
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {isBlocked && (
                                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-700">
                                    {startDate && isBefore(props.date, startDate)
                                      ? "Must be after start date"
                                      : getBlockedDateTooltip(props.date)}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            )
                          },
                        }}
                      />
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Rental Type:</span>
                <span className="font-medium">{rentalType === "full-day" ? "Full Day" : `Half Day (${timeSlot})`}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Date:</span>
                <span className="font-medium">
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Not selected"}
                  {rentalType === "full-day" && endDate && !isSameDay(startDate!, endDate) && (
                    <> - {format(endDate, "MMM dd, yyyy")}</>
                  )}
                </span>
              </div>
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
          <div className="w-full space-y-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={handleAddToCart}
                disabled={!camera.available || addedToCart || isDateBlocked(startDate!)}
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

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handleCheckout}
                disabled={cart.length===0}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </Button>
            </motion.div>
          </div>
        </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
