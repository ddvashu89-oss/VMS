import NextAuth, { type NextAuthOptions, type Session, type User } from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Hard-coded user for demo purposes
        const adminUser = {
          id: "1",
          name: "Admin",
          email: "admin@paryatan.org",
          // password hash for "Paryatan@VMS2024Admin"
          passwordHash: "$2b$12$W29/9McOfSJ3vocMFeTCaONiJGHhf212A/tSRWGy42oA7OKyr0bri",
          role: "admin",
        };
        if (!credentials) return null;
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          adminUser.passwordHash
        );
        if (credentials.email === adminUser.email && isPasswordValid) {
          return { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.role) {
        (session.user as Session["user"] & { role: string }).role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = (user as User & { role: string }).role;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
