
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

export type OrderData = {
  userEmail: string;
  userName: string;
  items: Array<string>; 
  subtotal: number;
  tax: number;
  total: number;
  phoneNumber: string;
  rentalType: string;
  timeSlot: string;
  startDate: string | Date;
  endDate: string | Date;
};

