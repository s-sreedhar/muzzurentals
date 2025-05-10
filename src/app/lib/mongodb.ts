import { MongoClient, Db } from "mongodb"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/camera-rental"

// --- Raw MongoClient Setup ---
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()

  cachedClient = client
  cachedDb = db

  return { client, db }
}

// --- Mongoose Setup ---
export async function connectToMongoose(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB with Mongoose")
  } catch (error) {
    console.error("Error connecting to MongoDB with Mongoose:", error)
    throw error
  }
}
