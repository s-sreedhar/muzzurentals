"use client"

import Link from "next/link"
// import { useFetchCameras } from "@/app/hooks/useFetchCameras"
// import { useCameraStore } from "@/stores/useCameraStore"
import { Header } from "@/components/header"
import { WelcomeBanner } from "@/components/welcome-banner"
import { CameraCard } from "@/components/camera-card"
import { motion } from "framer-motion"
// import { useEffect } from "react"
import {cameras} from "@/lib/data"
export default function Home() {
  // const { cameras, loading, fetchCameras } = useCameraStore()
  // useEffect(() => {
  //   if (cameras.length === 0) fetchCameras()
  // }, [])
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <WelcomeBanner />
      <div className="container mx-auto px-4 py-12 bg-gray-900">
        <motion.h2
          className="text-3xl font-bold mb-8 text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Available Cameras
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera, index) => (
            <motion.div
              key={camera.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/cameras/${camera.id}`}>
                <CameraCard camera={camera} />
              </Link>
            </motion.div>
          ))}
        </div> 
      </div>
    </main>
  )
}
