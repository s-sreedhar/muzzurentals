import mongoose, { Schema, type Document } from "mongoose"
import type { IUser } from "./User"

export interface IOrderItem {
  cameraId: string
  cameraName: string
  quantity: number
  pricePerDay: number
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | IUser
  userEmail: string
  userName: string
  items: IOrderItem[]
  subtotal: number
  tax: number
  total: number
  phoneNumber: string
  rentalType: "half-day" | "full-day"
  timeSlot?: "morning" | "afternoon" | "evening"
  startDate: Date
  endDate: Date
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    items: [
      {
        cameraId: { type: String, required: true },
        cameraName: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        pricePerDay: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    rentalType: { type: String, enum: ["half-day", "full-day"], required: true },
    timeSlot: { type: String, enum: ["morning", "afternoon", "evening"] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    paymentMethod: { type: String, required: true, default: "RazorPay" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
