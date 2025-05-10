export interface Camera {
  id: string
  name: string
  brand: string
  category: string
  description: string
  pricePerDay: number
  image: string
  available: boolean
  isNew: boolean
  specs: string[]
  included: string[]
}

export interface CartItem {
  id: string
  quantity: number
  rentalType?: "half-day" | "full-day"
  timeSlot?: "morning" | "afternoon" | "evening"
  startDate?: string
  endDate?: string
}
