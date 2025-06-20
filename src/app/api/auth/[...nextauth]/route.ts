import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/components/mailler-send/Otp";
import { randomBytes } from "crypto";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      companyId?: string | null;
    };
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorizing user with credentials:", credentials);

        if (!credentials?.email || !credentials.password) {
          console.error("Missing email or password");
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error("No user found with email:", credentials.email);
          throw new Error("No user found with that email");
        }

        if (!user.password) {
          console.error("Password missing for user:", user.email);
          throw new Error("User password is missing");
        }

        const isValid = await compare(credentials.password, user.password);
        console.log("Password validation result:", isValid);

        if (!isValid) {
          console.error("Invalid password for user:", user.email);
          throw new Error("Wrong Password");
        }

        // Return an object representing the user; NextAuth stores minimal info in token/session
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback triggered:", session, token);

      // session.user contains basic info; you can add role/id here
      session.user = {
        ...session.user,
        id: token.sub!,
        role: token.role as string,
        companyId: token.companyId as string,
      };
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT callback triggered:", token, user);

      // On first sign in, user object is available: store role in token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };