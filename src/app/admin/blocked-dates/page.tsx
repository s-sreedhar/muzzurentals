import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { BlockedDatesManagement } from "@/app/components/admin/blocked-dates-management"

export default function AdminBlockedDatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Blocked Dates Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>
          <div className="lg:col-span-3">
            <BlockedDatesManagement />
          </div>
        </div>
      </div>
    </main>
  )
}
