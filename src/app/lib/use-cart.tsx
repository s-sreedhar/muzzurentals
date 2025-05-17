"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Camera } from "./types"

export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  rentalType?: "half-day" | "full-day"
  fullDayType?: "9hrs" | "24hrs"
  timeSlot?: "morning" | "afternoon" | "evening"
  startDate?: string
  endDate?: string
  accessories?: {
    longLens: {
      included: boolean
      price: number
    }
    extraBattery: {
      included: boolean
      price: number
    }
  }
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateCartItem: (id: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error)
      localStorage.removeItem("cart")
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart, isInitialized])

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // For rental items, we need to check more than just the ID
      // because the same camera with different rental options should be separate items
      const isSameItem = (cartItem: CartItem) => {
        if (cartItem.id !== item.id) return false
        
        // Compare rental properties
        if (cartItem.rentalType !== item.rentalType) return false
        if (cartItem.startDate !== item.startDate) return false
        if (cartItem.endDate !== item.endDate) return false
        if (cartItem.timeSlot !== item.timeSlot) return false
        if (cartItem.fullDayType !== item.fullDayType) return false
        
        // Compare accessories
        if (cartItem.accessories?.longLens.included !== item.accessories?.longLens.included) return false
        if (cartItem.accessories?.extraBattery.included !== item.accessories?.extraBattery.included) return false
        
        return true
      }

      const existingItemIndex = prevCart.findIndex(isSameItem)

      if (existingItemIndex >= 0) {
        // Update quantity if same item exists
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity
        }
        return updatedCart
      } else {
        // Add new item
        return [...prevCart, item]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      let itemTotal = item.price * item.quantity
      
      // Add accessories prices if they exist
      if (item.accessories) {
        if (item.accessories.longLens.included) {
          itemTotal += item.accessories.longLens.price * item.quantity
        }
        if (item.accessories.extraBattery.included) {
          itemTotal += item.accessories.extraBattery.price * item.quantity
        }
      }
      
      return total + itemTotal
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}