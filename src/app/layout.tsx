import type React from "react"
import { CartProvider } from "@/lib/use-cart"
import { AuthProvider } from "@/components/auth-provider"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import type { Metadata } from "next"
import WhatsappFloatingIcon from "./components/whatsapp-icon"

export const metadata: Metadata = {
  title: "Muzzu Rentals - Professional Camera Rentals",
  description: "Rent professional cameras and equipment for your next photoshoot, event, or creative project.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-gray-900 text-white">
        <AuthProvider> 
          <CartProvider>
            <div className="flex-grow">{children}</div>
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
        <WhatsappFloatingIcon/>
      </body>
    </html>
  )
}
