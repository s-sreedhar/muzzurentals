"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { XCircle, ShoppingCart, RotateCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PaymentFailed() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/cart/checkout")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header (consistent with your design) */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Muzzu Rentals
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className="mb-8"
        >
          <div className="relative">
            <XCircle className="h-32 w-32 text-red-500" />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500 opacity-20"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1.5 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500"
        >
          Payment Failed!
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl mb-8 max-w-2xl text-gray-300"
        >
          We couldn't process your payment. Please try again or use a different payment method.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button 
            asChild
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <Link href="/cart/checkout" className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Try Again
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="border-gray-600 hover:bg-gray-800"
          >
            <Link href="/cart" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              View Cart
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className="text-gray-400 hover:bg-gray-800"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-1 bg-gradient-to-r from-red-500 to-pink-500 mt-8 rounded-full"
        />
        
        <p className="text-gray-500 mt-4">
          You'll be automatically redirected to checkout in 5 seconds...
        </p>
      </motion.main>
    </div>
  )
}