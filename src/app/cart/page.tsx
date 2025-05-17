"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CartItem, useCart } from "@/lib/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Trash2 } from 'lucide-react'
import { format, parseISO } from "date-fns"
import Link from "next/link"

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart } = useCart()
  const { toast } = useToast()
  console.log("cart is", cart)
  const [isClient, setIsClient] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setIsClient(true)
    
    // Calculate total including accessories
    const calculatedTotal = cart.reduce((total, item) => {
      let itemTotal = 0

      // Calculate base price based on rental type
      if (item.rentalType === "half-day") {
        itemTotal = item.price * item.quantity
      } else {
        // Full day rental
        if (item.startDate && item.endDate) {
          const start = parseISO(item.startDate)
          const end = parseISO(item.endDate)
          const diffTime = Math.abs(end.getTime() - start.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          itemTotal = item.price * diffDays * item.quantity
        } else {
          itemTotal = item.price * item.quantity
        }
      }

      // Add accessories prices
      if (item.accessories) {
        if (item.accessories.longLens.included) {
          itemTotal += item.accessories.longLens.price * item.quantity
        }
        if (item.accessories.extraBattery.included) {
          itemTotal += item.accessories.extraBattery.price * item.quantity
        }
      }

      return total + itemTotal
    }, 0)
    
    setTotal(calculatedTotal)
  }, [cart])

  const handleCheckout = () => {
    router.push("/cart/checkout")
  }

  const handleRemoveItem = (id: string, name: string) => {
    removeFromCart(id)
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
      variant: "default",
    })
  }

  const getTimeSlotLabel = (slot?: string): string => {
    if (!slot) return ""

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

  const getRentalPrice = (item: CartItem): number => {
    let price = 0

    if (item.rentalType === "half-day") {
      price = item.price * item.quantity
    } else {
      if (item.startDate && item.endDate) {
        const start = parseISO(item.startDate)
        const end = parseISO(item.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        price = item.price * diffDays * item.quantity
      } else {
        price = item.price * item.quantity
      }
    }

    // Add accessories prices
    if (item.accessories) {
      if (item.accessories.longLens.included) {
        price += item.accessories.longLens.price * item.quantity
      }
      if (item.accessories.extraBattery.included) {
        price += item.accessories.extraBattery.price * item.quantity
      }
    }

    return price
  }

  if (!isClient) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto mb-8"></div>
            <div className="h-10 bg-gray-700 rounded w-1/5 mx-auto"></div>
          </div>
        </div>
      </main>
    )
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="mb-8">Add some cameras to get started with your rental</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/">Browse Cameras</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Your Cart
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Cart Items</h3>

              {cart.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-start py-4 border-b border-gray-700">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg?height=96&width=96"}
                      alt={item.name || "Camera"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium text-white">{item.name || "Unknown Camera"}</h4>
                    <p className="text-gray-400">₹{item.price}/day</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-300">
                      <p>Rental Type: {item.rentalType === "full-day" ? `Full Day (${item.fullDayType})` : "Half Day"}</p>
                      {item.rentalType === "half-day" && item.timeSlot && (
                        <p>Time Slot: {getTimeSlotLabel(item.timeSlot)}</p>
                      )}
                      <p>
                        Date: {item.startDate ? format(parseISO(item.startDate), "MMM dd, yyyy") : "Not selected"}
                        {item.rentalType === "full-day" && item.endDate && item.startDate !== item.endDate && (
                          <> - {format(parseISO(item.endDate), "MMM dd, yyyy")}</>
                        )}
                      </p>
                      
                      {/* Display selected accessories */}
                      <div className="mt-3 space-y-1">
                        {item.accessories?.longLens.included && (
                          <p className="text-sm">• Long Lens (+₹100)</p>
                        )}
                        {item.accessories?.extraBattery.included && (
                          <p className="text-sm">• Extra Battery (+₹150)</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                    <div className="text-lg font-bold text-purple-400">
                      ₹{getRentalPrice(item).toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id, item.name || "Item")}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-4 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-purple-400">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}