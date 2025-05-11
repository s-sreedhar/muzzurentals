// models/Order.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  phoneNumber: string;
  rentalType: string;
  timeSlot: string;
  startDate: Date;
  endDate: Date;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    items: { type: [{ type: Schema.Types.Mixed }], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    rentalType: { type: String, required: true },
    timeSlot: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order