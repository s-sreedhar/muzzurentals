import mongoose, { Schema, type Document } from "mongoose"

export interface ICamera extends Document {
  id: string
  name: string
  brand: string
  category: string
  description: string
  pricePerDay: number
  image: string
  available: boolean
  isNew: boolean
  rating: number
  reviews: number
  specs: string[]
  included: string[]
}

const CameraSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  image: { type: String, required: true },
  available: { type: Boolean, required: true, default: true },
  isNew: { type: Boolean, required: true, default: false },
  rating: { type: Number, required: true, default: 0 },
  reviews: { type: Number, required: true, default: 0 },
  specs: { type: [String], required: true, default: [] },
  included: { type: [String], required: true, default: [] },
})

export default mongoose.models.Camera || mongoose.model<ICamera>("Camera", CameraSchema)
