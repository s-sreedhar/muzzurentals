import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Define NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (!token.sub) {
        throw new Error("Missing token.sub (user ID) in session callback");
      }

      if (session.user) {
        session.user.id = token.sub;
        // console.log("Session is", session)
      }

      return session;
    },
  },
  pages: {
    signIn: "/signin", // Optional: Custom sign-in page
  },
};
