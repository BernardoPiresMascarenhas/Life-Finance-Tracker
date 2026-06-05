import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware usa SÓ a config edge-safe (sem Prisma/bcrypt).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protege tudo, menos assets estáticos e a rota de API do Auth.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
