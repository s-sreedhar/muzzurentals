// useFetchCameras.ts
import { useEffect, useState } from "react"
import type { Camera } from "@/lib/types"

export function useFetchCameras() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await fetch("/api/cameras")
        const data = await res.json()
        if (data.success) {
          setCameras(data.data)
        }
      } catch (err) {
        console.error("Failed to fetch cameras", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCameras()
  }, [])

  return { cameras, loading }
}
