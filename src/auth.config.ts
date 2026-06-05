import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/patrimonio');

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    // Garante que o ID do usuário vá para a sessão
    session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
  },
} satisfies NextAuthConfig;