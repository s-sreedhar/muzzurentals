"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export function AuthButton() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const handleSignOut = () => {
    toast({
      title: "Signing out",
      description: "You have been signed out successfully.",
      variant: "default",
    })
    signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled className="text-white">
        <User className="h-5 w-5" />
      </Button>
    )
  }

  if (status === "authenticated") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" className="relative text-white hover:bg-gray-800">
              <User className="h-5 w-5" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
          <div className="px-2 py-1.5 text-sm font-medium">{session.user?.name}</div>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem asChild className="text-gray-300 focus:bg-gray-700 focus:text-white">
            <Link href="/profile">My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-gray-300 focus:bg-gray-700 focus:text-white">
            <Link href="/cart">My Cart</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem onClick={handleSignOut} className="text-gray-300 focus:bg-gray-700 focus:text-white">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button variant="ghost" asChild className="text-white hover:bg-gray-800">
        <Link href="/auth/signin">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    </motion.div>
  )
}
