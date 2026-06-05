import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userLabel = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader userLabel={userLabel} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
