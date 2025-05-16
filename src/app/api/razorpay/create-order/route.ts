import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

interface CreateOrderRequest {
  amount: number
  currency?: string
  phoneNumber?: string
}

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' }: CreateOrderRequest = await request.json()

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      )
    }

    const options = {
      amount: amount.toString(), // Razorpay expects amount as string
      currency,
      receipt: `order_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}