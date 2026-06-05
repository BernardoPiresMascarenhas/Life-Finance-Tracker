import { redirect } from "next/navigation";

// Rota raiz: o middleware já cuida do gate de auth.
export default function Home() {
  redirect("/dashboard");
}
