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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <DashboardTopbar />
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

