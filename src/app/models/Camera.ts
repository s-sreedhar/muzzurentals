import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ICamera extends Document {
  id: string
  name: string
  brand: string
  category: string
  description: string
  pricing: {
    perDay: number
    halfDay: number
    fullDay9hrs: number
    fullDay24hrs: number
  }
  image: string
  available: boolean
  isNew: boolean
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
    pricing: {
      perDay: { 
        type: Number, 
        required: true,
        min: 0 
      },
      halfDay: { 
        type: Number, 
        required: true,
        min: 0 
      },
      fullDay9hrs: { 
        type: Number, 
        required: true,
        min: 0 
      },
      fullDay24hrs: { 
        type: Number, 
        required: true,
        min: 0 
      }
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
    isNew: {
      type: Boolean,
      required: true,
      default: false
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
        // Flatten pricing for backward compatibility
        ret.pricePerDay = ret.pricing.perDay
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

// Virtual for days since added (for new badge logic)
CameraSchema.virtual('daysSinceAdded').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Pre-save hook to ensure consistency
CameraSchema.pre('save', function(next) {
  // Ensure pricing consistency
  if (this.isModified('pricing')) {
    const { halfDay, fullDay9hrs, fullDay24hrs, perDay } = this.pricing
    
    // Validate that shorter durations don't cost more than longer ones
    if (halfDay > fullDay9hrs || fullDay9hrs > fullDay24hrs || fullDay24hrs > perDay) {
      throw new Error("Pricing structure must follow: halfDay ≤ fullDay9hrs ≤ fullDay24hrs ≤ perDay")
    }
  }

  // Clean up arrays
  if (this.isModified('specs') || this.isModified('included')) {
    this.specs = this.specs.filter(item => item.trim().length > 0)
    this.included = this.included.filter(item => item.trim().length > 0)
  }

  // Automatically mark as new if created within last 7 days
  if (this.isNew) {
    this.isNew = this.daysSinceAdded < 7
  }

  next()
})

// Static method for finding new cameras
CameraSchema.statics.findNew = function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return this.find({ createdAt: { $gte: sevenDaysAgo } })
}

const Camera: Model<ICamera> = mongoose.models.Camera || mongoose.model<ICamera>("Camera", CameraSchema)

export default Camera