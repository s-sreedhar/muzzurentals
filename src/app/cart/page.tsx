"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/lib/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { cameras } from "@/lib/data"
import { format, parseISO } from "date-fns"

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart } = useCart()
  const { toast } = useToast()

  const cartItems = cart.map((item) => {
    const camera = cameras.find((c) => c.id === item.id)
    return { ...item, details: camera }
  })

  // Calculate subtotal based on rental type and duration
  const subtotal = cartItems.reduce((total, item) => {
    if (!item.details) return total

    const basePrice = item.details.pricePerDay

    // For half-day rentals
    if (item.rentalType === "half-day") {
      return total + basePrice * 0.6 * item.quantity // 60% of full day price
    }

    // For full-day rentals
    if (item.startDate && item.endDate) {
      const start = parseISO(item.startDate)
      const end = parseISO(item.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return total + basePrice * diffDays * item.quantity
    }

    return total + basePrice * item.quantity
  }, 0)

  const tax = subtotal * 0.1
  const total = subtotal + tax

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

  const getTimeSlotLabel = (slot?: string) => {
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

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="mb-8">Add some cameras to get started with your rental</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <a href="/">Browse Cameras</a>
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

              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center py-4 border-b border-gray-700">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <Image
                      src={item.details?.image || "/placeholder.svg?height=96&width=96"}
                      alt={item.details?.name || "Camera"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium text-white">{item.details?.name}</h4>
                    <p className="text-gray-400">₹{item.details?.pricePerDay}/day</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-300">
                      <p>Rental Type: {item.rentalType === "full-day" ? "Full Day" : "Half Day"}</p>
                      {item.rentalType === "half-day" && item.timeSlot && (
                        <p>Time Slot: {getTimeSlotLabel(item.timeSlot)}</p>
                      )}
                      <p>
                        Date: {item.startDate ? format(parseISO(item.startDate), "MMM dd, yyyy") : "Not selected"}
                        {item.rentalType === "full-day" && item.endDate && item.startDate !== item.endDate && (
                          <> - {format(parseISO(item.endDate), "MMM dd, yyyy")}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                    <div className="text-lg font-bold text-purple-400">
                      ₹
                      {item.rentalType === "half-day"
                        ? (item.details?.pricePerDay || 0) * 0.6
                        : (item.details?.pricePerDay || 0) *
                          (item.startDate && item.endDate
                            ? Math.ceil(
                                Math.abs(parseISO(item.endDate).getTime() - parseISO(item.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : 1)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id, item.details?.name || "Item")}
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax (10%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2 bg-gray-700" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-purple-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
