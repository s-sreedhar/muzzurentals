// app/api/razorpay/verify-payment/route.ts
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Order from '@/models/Order'
import { connectToMongoose } from '@/lib/mongodb'
import mongoose from 'mongoose'
import twilio from 'twilio'
// import { useCart } from '@/app/lib/use-cart'
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    // Format phone number to E.164 format if needed
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    })

    console.log('WhatsApp message sent:', response.sid)
    return response
  } catch (error) {
    console.error('Twilio WhatsApp error:', error)
    // Fail silently - don't block order confirmation
  }
}

export async function POST(request: Request) {
  await connectToMongoose()
  
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Get full order details with proper typing
    const order = await Order.findById(orderId).lean() as (typeof Order extends { schema: infer S } ? mongoose.InferSchemaType<S> : any) & { userPhone?: string }
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const result = await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          paymentStatus: 'paid',
          status: 'confirmed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paymentVerifiedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }
    
     if (result.matchedCount === 1) {
      // Return instruction to clear cart
      return NextResponse.json({
        success: true,
        message: 'Payment verified and order updated',
        orderId,
        clearCart: true,  // Flag to indicate cart should be cleared
      })
    }
    // Send WhatsApp confirmation if phone exists
    if (order.userPhone) {
      const message = `🚀 Thank you for your order #${order._id}!\n\n` +
        `💵 Amount: ₹${order.total.toFixed(2)}\n` +
        `📦 Items: ${order.items.map(i => i.name).join(', ')}\n\n` +
        `🔍 Track your order: ${process.env.BASE_URL}/orders/${order._id}\n\n` +
        `Need help? Reply to this message!`

      await sendWhatsAppMessage(order.userPhone, message)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order updated',
      orderId
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Payment verification failed'
      },
      { status: 500 }
    )
  }
}