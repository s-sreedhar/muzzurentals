// app/api/razorpay/verify-payment/route.ts
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Order from '@/models/Order'
import { connectToMongoose } from '@/lib/mongodb'
import mongoose from 'mongoose'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    // Update order status using native MongoDB driver
    const db = mongoose.connection.db
    const result = await db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
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