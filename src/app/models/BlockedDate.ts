import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IBlockedDate extends Document {
  cameraId: string
  startDate: Date
  endDate: Date
  reason?: string
  isFullDay: boolean
  timeSlot?: "morning" | "afternoon" | "evening"
  createdAt: Date
  updatedAt: Date
}

const BlockedDateSchema: Schema<IBlockedDate> = new Schema(
  {
    cameraId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    isFullDay: { type: Boolean, required: true, default: true },
    timeSlot: { type: String, enum: ["morning", "afternoon", "evening"] },
  },
  { timestamps: true }
)

// Compound index for efficient querying
BlockedDateSchema.index({ cameraId: 1, startDate: 1, endDate: 1 })

const BlockedDate: Model<IBlockedDate> =
  mongoose.models.BlockedDate || mongoose.model<IBlockedDate>("BlockedDate", BlockedDateSchema)

export default BlockedDate
