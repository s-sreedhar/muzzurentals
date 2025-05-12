"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/use-cart"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import { motion } from "framer-motion"
import { ServiceAreaBanner } from "./service-area-banner"
import favicon from "@/assets/favicon.ico"
export function Header() {
  const { cart } = useCart()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors by only showing cart count after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
    <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div className="relative w-10 h-10" whileHover={{ rotate: 10 }} transition={{ duration: 0.2 }}>
            <Image src={favicon} alt="Muzzu Rentals" fill className="object-contain" />
          </motion.div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Muzzu Rentals
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <AuthButton />
          <Link href="/cart">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" className="relative text-white hover:bg-gray-800">
                <ShoppingCart className="h-6 w-6" />
                {mounted && itemCount > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
    <ServiceAreaBanner/>
    </>
  )
}
