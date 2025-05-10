
import { create } from "zustand"
import type { Camera } from "@/lib/types"

interface CameraState {
  cameras: Camera[]
  loading: boolean
  fetchCameras: () => Promise<void>
}

export const useCameraStore = create<CameraState>((set) => ({
  cameras: [],
  loading: false,
  fetchCameras: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/cameras")
      const data = await res.json()
      if (data.success) {
        set({ cameras: data.data })
      }
    } catch (err) {
      console.error("Failed to fetch cameras", err)
    } finally {
      set({ loading: false })
    }
  },
}))
