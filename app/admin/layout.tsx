import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';

/**
 * Layout do Dashboard ADMIN
 * Sidebar + Topbar + Área de conteúdo
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <AdminTopbar />
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

