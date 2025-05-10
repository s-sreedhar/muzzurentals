import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-24 w-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          You don't have permission to access the admin dashboard. This area is restricted to authorized administrators
          only.
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </main>
  )
}
