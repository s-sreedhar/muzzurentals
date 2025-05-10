"use server"

import { hash } from "bcrypt"

// This would be your database in a real application
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    // hashed password: "password123"
    password: "$2b$10$8r0qPVaJeLES/x.Rb2PVaeSLuyt0nO.OTZ1Vmd5XlQHLG/Rbtdnx2",
  },
]

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return { success: false, message: "User already exists" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
    }

    // Add to users array (in a real app, this would be a database operation)
    users.push(newUser)

    return { success: true, message: "User registered successfully" }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An error occurred during registration" }
  }
}
