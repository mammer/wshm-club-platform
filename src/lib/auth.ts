import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = credentials.email as string;
        const email = identifier.includes("@") ? identifier : `${identifier}@wshm.ma`;

        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.photoUrl ?? null };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session: updSession }) {
      if (user) {
        token.role = (user as { role?: string }).role; // never assume a role
        token.picture = (user as { image?: string | null }).image ?? null;
      }
      // Handle session update (called when useSession update() is invoked)
      if (trigger === "update" && updSession) {
        if (updSession.name) token.name = updSession.name;
        if (updSession.image !== undefined) token.picture = updSession.image;
        // Re-fetch fresh photoUrl from DB
        try {
          const dbUser = await prisma.adminUser.findUnique({ where: { email: token.email as string }, select: { name: true, photoUrl: true, role: true } });
          if (dbUser) {
            token.name = dbUser.name;
            token.picture = dbUser.photoUrl ?? null;
            token.role = dbUser.role;
          }
        } catch { /* ignore */ }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        session.user.image = (token.picture as string | null | undefined) ?? null;
        session.user.name = token.name as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      if (isAdminRoute && !isLoginPage && !auth?.user) return false;
      return true;
    },
  },
});
