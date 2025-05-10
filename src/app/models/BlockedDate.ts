import mongoose, { Schema, type Document } from "mongoose"

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

const BlockedDateSchema: Schema = new Schema(
  {
    cameraId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    isFullDay: { type: Boolean, required: true, default: true },
    timeSlot: { type: String, enum: ["morning", "afternoon", "evening"] },
  },
  { timestamps: true },
)

// Create a compound index to efficiently query blocked dates for a camera
BlockedDateSchema.index({ cameraId: 1, startDate: 1, endDate: 1 })

export default mongoose.models.BlockedDate || mongoose.model<IBlockedDate>("BlockedDate", BlockedDateSchema)
