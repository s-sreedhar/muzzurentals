  import { Header } from "@/components/header"
  import { AdminSidebar } from "@/components/admin/admin-sidebar"
  import { CamerasManagement } from "@/components/admin/camera-management"

  export default function AdminCamerasPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Camera Management</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AdminSidebar />
            </div>
            <div className="lg:col-span-3">
              <CamerasManagement />
            </div>
          </div>
        </div>
      </main>
    )
  }
