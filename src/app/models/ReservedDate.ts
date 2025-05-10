import mongoose, { Schema, type Document } from "mongoose"

export interface IReservedDate extends Document {
  cameraId: string
  orderId: mongoose.Types.ObjectId
  startDate: Date
  endDate: Date
  isFullDay: boolean
  timeSlot?: "morning" | "afternoon" | "evening"
  createdAt: Date
  updatedAt: Date
}

const ReservedDateSchema: Schema = new Schema(
  {
    cameraId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isFullDay: { type: Boolean, required: true, default: true },
    timeSlot: { type: String, enum: ["morning", "afternoon", "evening"] },
  },
  { timestamps: true },
)

// Create a compound index to efficiently query reserved dates for a camera
ReservedDateSchema.index({ cameraId: 1, startDate: 1, endDate: 1 })

export default mongoose.models.ReservedDate || mongoose.model<IReservedDate>("ReservedDate", ReservedDateSchema)
