import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyCredentials } from "@/modules/auth/service";
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: Number(process.env.SESSION_MAX_AGE_HOURS ?? 8) * 3600 },
  providers: [Credentials({ credentials: { login: {}, password: {} }, authorize: verifyCredentials })],
  callbacks: {
    jwt({ token, user }) { if (user) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
