"use server"

import { connectToMongoose } from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"
import BlockedDate from "@/models/BlockedDate"
import { sendWhatsAppTextMessage } from "@/lib/whatsapp"

interface OrderItem {
  cameraId: string
  cameraName?: string
  quantity: number
  pricePerDay?: number
}

interface OrderData {
  userId?: string
  userEmail?: string
  userName?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  phoneNumber: string
  rentalType: "half-day" | "full-day"
  timeSlot?: "morning" | "afternoon" | "evening"
  startDate: string
  endDate: string
  status: string
  createdAt: string
}

export async function createOrder(orderData: OrderData) {
  try {
    await connectToMongoose()

    // Generate a unique ID
    const orderId = `ORD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`

    // Find user in database
    let userId = orderData.userId
    if (orderData.userEmail && !userId) {
      const user = await User.findOne({ email: orderData.userEmail }).exec()
      if (user) {
        userId = user._id.toString()
      }
    }

    // Create the order in MongoDB
    const newOrder = new Order({
      id: orderId,
      userId,
      userEmail: orderData.userEmail,
      userName: orderData.userName,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      phoneNumber: orderData.phoneNumber,
      rentalType: orderData.rentalType,
      timeSlot: orderData.timeSlot,
      startDate: new Date(orderData.startDate),
      endDate: new Date(orderData.endDate),
      status: "confirmed",
      paymentMethod: "RazorPay",
      paymentStatus: "paid",
    })

    await newOrder.save()

    // Create reserved dates for each camera in the order
    for (const item of orderData.items) {
      const blockedDate = new BlockedDate({
        cameraId: item.cameraId,
        orderId: newOrder._id,
        startDate: new Date(orderData.startDate),
        endDate: new Date(orderData.endDate),
        isFullDay: orderData.rentalType === "full-day",
        timeSlot: orderData.timeSlot,
      })

      await blockedDate.save()
    }

    // Create a message for WhatsApp
    const whatsappItems = orderData.items.map((item) => ({
      name: item.cameraName || `Camera #${item.cameraId}`,
      quantity: item.quantity,
    }))

    const message = `🎉 *Order Confirmed!* 🎉

Hello ${orderData.userName || "Valued Customer"},

Your order #${orderId} has been confirmed. Thank you for choosing Muzzu Rentals!

*Order Details:*
${whatsappItems.map((item) => `• ${item.name} (Qty: ${item.quantity})`).join("\n")}

*Rental Type:* ${orderData.rentalType === "full-day" ? "Full Day" : `Half Day (${orderData.timeSlot})`}
*Rental Period:* ${new Date(orderData.startDate).toLocaleDateString()} ${orderData.rentalType === "full-day" && orderData.startDate !== orderData.endDate ? `- ${new Date(orderData.endDate).toLocaleDateString()}` : ""}
*Total Amount:* $${orderData.total.toFixed(2)}

Your rental equipment will be ready for pickup or delivery as per your selected option. We'll send you another message with tracking details soon.

If you have any questions, please reply to this message or call us at +91 93925 53149.

Thank you for your business!

*Muzzu Rentals*`

    // Send the WhatsApp message
    const whatsappResult = await sendWhatsAppTextMessage(orderData.phoneNumber, message)

    return {
      success: true,
      orderId,
      whatsappSent: whatsappResult.success,
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return {
      success: false,
      message: "An error occurred while creating the order",
    }
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    await connectToMongoose()

    // Find orders for the user
    const userOrders = await Order.find({ userId }).sort({ createdAt: -1 })

    return {
      success: true,
      orders: userOrders,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return {
      success: false,
      message: "An error occurred while fetching orders",
    }
  }
}
