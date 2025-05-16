import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  userId?: string;
  userEmail: string;
  userName?: string;
  googleId?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    rentalType: string;
    timeSlot: string;
  }[];
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
    userId: String,
    userEmail: { type: String, required: true },
    userName: String,
    googleId: String,
    items: { 
      type: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        rentalType: String,
        timeSlot: String
      }], 
      required: true 
    },
    total: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    rentalType: { type: String, required: true },
    timeSlot: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true, default: 'pending' },
    paymentMethod: { type: String, required: true, default: 'razorpay' },
    paymentStatus: { type: String, required: true, default: 'pending' },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;