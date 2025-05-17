"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/use-cart"
import { cameras } from "@/lib/data"
import Image from "next/image"
import { CalendarDays, Package } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { cart } = useCart()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile")
    }
  }, [status, router])

  // Mock rental history data
  const rentalHistory = [
    {
      id: "rental-1",
      cameraId: "canon-eos-r5",
      startDate: "2023-10-15",
      endDate: "2023-10-18",
      status: "Completed",
    },
    {
      id: "rental-2",
      cameraId: "sony-a7siii",
      startDate: "2023-09-05",
      endDate: "2023-09-10",
      status: "Completed",
    },
  ]

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center bg-gray-900">
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center bg-gray-900">
          <p>Please log in to view your profile</p>
          <Button asChild className="mt-4">
            <a href="/login?callbackUrl=/profile">Login</a>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs defaultValue="profile">
            <TabsList className="mb-8 text-2xl">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {/* <TabsTrigger value="rentals">Rental History</TabsTrigger> */}
              <TabsTrigger value="cart">Current Cart</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 ">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p className="mt-1 text-lg">{session?.user?.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-lg">{session?.user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="rentals">
              <Card>
                <CardHeader>
                  <CardTitle>Rental History</CardTitle>
                  <CardDescription>View your past and current rentals</CardDescription>
                </CardHeader>
                <CardContent>
                  {rentalHistory.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">You haven&apos;t rented any cameras yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {rentalHistory.map((rental) => {
                        const camera = cameras.find((c) => c.id === rental.cameraId)
                        return (
                          <div key={rental.id} className="flex flex-col md:flex-row gap-4 border-b pb-6">
                            <div className="w-full md:w-1/4">
                              <div className="relative h-32 w-full rounded-md overflow-hidden">
                                <Image
                                  src={camera?.image || "/placeholder.svg"}
                                  alt={camera?.name || "Camera"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{camera?.name}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <div className="flex items-center text-gray-600">
                                  <CalendarDays className="h-4 w-4 mr-2" />
                                  <span>
                                    {rental.startDate} to {rental.endDate}
                                  </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Package className="h-4 w-4 mr-2" />
                                  <span>Status: {rental.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent> */}

            <TabsContent value="cart">
              <Card>
                <CardHeader>
                  <CardTitle>Current Cart</CardTitle>
                  <CardDescription>Items in your cart</CardDescription>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">Your cart is empty.</p>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item) => {
                        const camera = cameras.find((c) => c.id === item.id)
                        return (
                          <div key={item.id} className="flex flex-col md:flex-row gap-4 border-b pb-6">
                            <div className="w-full md:w-1/4">
                              <div className="relative h-32 w-full rounded-md overflow-hidden">
                                <Image
                                  src={camera?.image || "/placeholder.svg"}
                                  alt={camera?.name || "Camera"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{camera?.name}</h3>
                              <p className="text-gray-600">
                                ${camera?.pricePerDay}/day × {item.quantity} = $
                                {(camera?.pricePerDay || 0) * item.quantity}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div className="pt-4">
                        <Button asChild>
                          <a href="/cart">Go to Cart</a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}