"use client"

import Image from "next/image"
import type { Camera } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface CameraCardProps {
  camera: Camera
}

export function CameraCard({ camera }: CameraCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-xl bg-gray-800 border-gray-700 text-white">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={camera.image || "/placeholder.svg"}
            alt={camera.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
          {camera.isNew && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
              New
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-xl font-semibold text-white">{camera.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{camera.brand}</p>
          <div className="flex items-center mt-2">
            <span className="text-lg font-bold text-purple-400">₹{camera.pricePerDay}</span>
            <span className="text-gray-400 text-sm ml-1">/day</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          {/* <div className="flex items-center text-sm">
            <span className={camera.available ? "text-green-400" : "text-red-400"}>
              {camera.available ? "Available" : "Unavailable"}
            </span>
          </div> */}
          <Badge variant="outline" className="font-normal border-purple-500 text-purple-400">
            {camera.category}
          </Badge>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
