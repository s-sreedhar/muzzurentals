import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ICamera extends Document {
  id: string
  name: string
  brand: string
  category: string
  description: string
  pricePerDay: number
  image: string
  available: boolean
  // isNew: boolean // Indicates if the camera is new
  specs: string[]
  included: string[]
}

const CameraSchema: Schema<ICamera> = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  image: { type: String, required: true },
  available: { type: Boolean, required: true, default: true },
  // isNew: { type: Boolean, required: true, default: false }, // Schema definition for isNew
  specs: { type: [String], required: true, default: [] },
  included: { type: [String], required: true, default: [] },
})

const Camera: Model<ICamera> = mongoose.models.Camera || mongoose.model<ICamera>("Camera", CameraSchema)

export default Camera
