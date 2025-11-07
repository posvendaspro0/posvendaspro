import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';

/**
 * Layout do Dashboard CLIENT
 * Sidebar + Topbar + Área de conteúdo
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

