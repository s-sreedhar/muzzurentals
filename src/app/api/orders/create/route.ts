import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-options'
import Order from '@/models/Order'
import { connectToMongoose } from '@/app/lib/mongodb'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    await connectToMongoose()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const requiredFields = [
      'items',
      'total',
      'phoneNumber',
      'rentalType',
      'timeSlot',
      'startDate',
      'endDate'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      )
    }

    const orderData = {
      items: body.items.map(item => ({
        productId: item.productId || new mongoose.Types.ObjectId().toString(),
        name: item.name || 'Unnamed Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || '',
        rentalType: item.rentalType || 'full-day',
        timeSlot: item.timeSlot || 'morning'
      })),
      total: body.total,
      phoneNumber: body.phoneNumber,
      rentalType: body.rentalType,
      timeSlot: body.timeSlot,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      googleId: session.user.googleId,
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || ''
    }

    const order = new Order(orderData)
    await order.save()

    return NextResponse.json({
      success: true,
      orderId: order._id,
      order: {
        _id: order._id,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Order creation error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Order with this ID already exists' },
        { status: 409 }
      )
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}