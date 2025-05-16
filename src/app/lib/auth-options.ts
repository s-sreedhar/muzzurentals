import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import User from "@/models/User"
import { connectToMongoose } from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
 callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.googleId = account?.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        await connectToMongoose();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            googleId: account?.providerAccountId,
          });
        }
        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false; // Return false to deny access
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
}
