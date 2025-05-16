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
  specs: string[]
  included: string[]
  createdAt: Date
  updatedAt: Date
}

const CameraSchema: Schema<ICamera> = new Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    brand: { 
      type: String, 
      required: true,
      trim: true 
    },
    category: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String, 
      required: true,
      trim: true 
    },
    pricePerDay: { 
      type: Number, 
      required: true,
      min: 0 
    },
    image: { 
      type: String, 
      required: true,
      trim: true 
    },
    available: { 
      type: Boolean, 
      required: true, 
      default: true 
    },
    specs: { 
      type: [String], 
      required: true, 
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v),
        message: "Specs must be an array of strings"
      } 
    },
    included: { 
      type: [String], 
      required: true, 
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v),
        message: "Included items must be an array of strings"
      } 
    }
  },
  { 
    timestamps: true,  // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id
        delete ret.__v
        return ret
      }
    },
    toObject: {
      virtuals: true
    }
  }
)

// Add index for frequently queried fields
CameraSchema.index({ name: 'text', brand: 'text', category: 'text' })

// Pre-save hook to ensure consistency
CameraSchema.pre('save', function(next) {
  if (this.isModified('specs') || this.isModified('included')) {
    this.specs = this.specs.filter(item => item.trim().length > 0)
    this.included = this.included.filter(item => item.trim().length > 0)
  }
  next()
})

const Camera: Model<ICamera> = mongoose.models.Camera || mongoose.model<ICamera>("Camera", CameraSchema)

export default Camera