"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/lib/use-cart"
import { useToast } from "@/hooks/use-toast"
import { cameras } from "@/lib/data"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, ShieldCheck, Truck, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [whatsappSent, setWhatsappSent] = useState(false)

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with checkout.",
        variant: "destructive",
      })
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/cart/checkout")}`)
    }
  }, [status, router, toast])

  // Calculate cart totals
  const cartItems = cart.map((item) => {
    const camera = cameras.find((c) => c.id === item.id)
    return { ...item, details: camera }
  })

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.details?.pricePerDay || 0) * item.quantity
  }, 0)

  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError("")

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number to continue.",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    try {
      // Step 1: Create order on your server
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Razorpay expects amount in paise
          currency: 'INR',
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create Razorpay order')
      }

      const orderData = await orderResponse.json()

      // Step 2: Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'CameraRent',
        description: 'Camera Rental Payment',
        image: '/logo.png',
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: phoneNumber,
        },
        theme: {
          color: '#685cfd',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on your server
            const verificationResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  userId: session?.user?.id,
                  items: cartItems,
                  total,
                  phoneNumber,
                },
              }),
            })

            const verificationData = await verificationResponse.json()

            if (verificationData.success) {
              setIsSuccess(true)
              clearCart()
              setWhatsappSent(verificationData.whatsappSent || false)
              toast({
                title: "Payment Successful!",
                description: "Your rental has been successfully processed.",
                variant: "default",
              })
              setTimeout(() => {
                router.push("/profile")
              }, 3000)
            } else {
              throw new Error(verificationData.message || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            setError('Payment verification failed')
            toast({
              title: 'Payment Error',
              description: 'There was an issue verifying your payment.',
              variant: 'destructive',
            })
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment.',
            })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Failed to process payment')
      toast({
        title: 'Payment Error',
        description: 'There was an issue processing your payment.',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </main>
    )
  }

  if (cart.length === 0 && !isSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center bg-gray-900">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="mb-8 text-gray-400">Add some cameras to get started with your rental</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <a href="/">Browse Cameras</a>
            </Button>
          </motion.div>
        </div>
      </main>
    )
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <Header />
        <div className="container mx-auto px-4 py-12 text-center bg-gray-900">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gray-800 border-gray-700 text-white overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600" />
                <CardHeader>
                  <CardTitle className="text-green-400">Order Confirmed!</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your rental has been successfully processed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">
                    Thank you for your order! A confirmation has been sent to {session?.user?.email}.
                  </p>

                  {whatsappSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="bg-green-900/20 p-3 rounded-lg border border-green-800 flex items-center"
                    >
                      <MessageSquare className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-green-300 text-sm">
                        Order details have been sent to your WhatsApp number
                      </span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center mb-2">
                        <ShieldCheck className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-400">Secured</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                        <Truck className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="text-xs text-gray-400">Delivery</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-pink-900/30 flex items-center justify-center mb-2">
                        <Phone className="h-5 w-5 text-pink-400" />
                      </div>
                      <span className="text-xs text-gray-400">Support</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <a href="/profile">View Your Profile</a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container mx-auto px-4 py-12 bg-gray-900">
        <motion.h1
          className="text-3xl font-bold mb-8 text-center md:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form onSubmit={handleCheckout}>
              <div className="space-y-8">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Card className="bg-gray-800 border-gray-700 text-white overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          defaultValue={session?.user?.name?.split(" ")[0] || ""}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          defaultValue={session?.user?.name?.split(" ")[1] || ""}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">
                        Phone Number (WhatsApp)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">
                        We'll send your order confirmation and updates via WhatsApp to this number
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700 text-white overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                  <CardHeader>
                    <CardTitle>Payment with Razorpay</CardTitle>
                    <CardDescription className="text-gray-400">Fast and secure payment</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-purple-400" />
                      </div>
                      <p className="text-gray-300">
                        Click the button below to proceed with your secure payment of ₹{(total * 83.33).toFixed(2)} via Razorpay.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-14 text-lg"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      `Pay Securely with Razorpay • ₹${(total * 83.33).toFixed(2)}`
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div>
                      <p className="font-medium">{item.details?.name}</p>
                      <p className="text-sm text-gray-400">
                        ₹{(item.details?.pricePerDay || 0 * 83.33).toFixed(2)}/day × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{((item.details?.pricePerDay || 0) * item.quantity * 83.33).toFixed(2)}</p>
                  </motion.div>
                ))}

                <Separator className="bg-gray-700" />

                <div className="flex justify-between text-gray-300">
                  <p>Subtotal</p>
                  <p className="font-medium">₹{(subtotal * 83.33).toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-gray-300">
                  <p>Tax (10%)</p>
                  <p className="font-medium">₹{(tax * 83.33).toFixed(2)}</p>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p className="text-purple-400">₹{(total * 83.33).toFixed(2)}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center text-xs text-gray-400">
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-400" />
                  Secure checkout powered by Razorpay
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}