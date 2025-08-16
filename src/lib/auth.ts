import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { type NextAuthOptions } from "next-auth";
import { Role } from "@/generated/prisma";

// Extend NextAuth types to include additional fields in Session and JWT
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role; // Use Prisma Role enum
      name?: string | null;
      email?: string | null;
      companyId?: string | null;
      currentCompanyId?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      createdAt?: Date | null;
      employeeId?: string | null;
      image?: string;
    };
  }
  interface JWT {
    role?: Role;
    companyId?: string | null;
    currentCompanyId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    createdAt?: Date | null;
    employeeId?: string | null;
    image?: string;
  }
}

export const authOptions: NextAuthOptions = {
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
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password required");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
            companyId: true,
            currentCompanyId: true,
            employeeId: true,
            createdAt: true,
            password: true, // Needed for validation
            images : { select: { url: true }, take : 1 }, // Optional, if you want to include user image
          },
        });
        if (!user || !user.password) {
          throw new Error("User not found/Invalid credentials");
        }
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Wrong Password");
        }
        // Return only safe fields, combining firstName and lastName into name if needed
        return {
          id: user.id,
          email: user.email,
          name: user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null),
          role: user.role,
          companyId: user.companyId,
          currentCompanyId : user.currentCompanyId,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          employeeId: user.employeeId,
          image: user.images?.[0]?.url, // Use the first image URL if available
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
        token.currentCompanyId = (user as any).currentCompanyId;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.createdAt = (user as any).createdAt;
        token.employeeId = (user as any).employeeId;
        token.image = (user as any).image;
      }
  
      // Update the JWT with the new currentCompanyId if it was changed
      if (token.currentCompanyId) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { currentCompanyId: true },
        });
        token.currentCompanyId = updatedUser?.currentCompanyId || token.currentCompanyId;
      }
  
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role! as Role;
        session.user.companyId = token.companyId as string;
        session.user.currentCompanyId = token.currentCompanyId as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.createdAt = token.createdAt as Date;
        session.user.employeeId = token.employeeId as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};