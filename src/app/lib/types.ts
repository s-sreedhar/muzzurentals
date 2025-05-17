
export interface Camera {
  id: string
  name: string
  brand: string
  category: string
  description: string
  pricing: {
    halfDay: number;
    fullDay9hrs: number;
    fullDay24hrs: number;
  }
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
  fullDayType?: "9-hrs" | "24-hrs"
  timeSlot?: "morning" | "afternoon" | "evening"
  startDate?: string
  endDate?: string
  accessories?: {
    longLens: boolean
    extraBattery: boolean
  }
}

export type OrderData = {
  userEmail: string;
  userName: string;
  items: Array<string>; 
  subtotal: number;
  tax: number;
  total: number;
  phoneNumber: string;
  rentalType: string;
  fullDayType:string
  timeSlot: string;
  startDate: string | Date;
  endDate: string | Date;
};

