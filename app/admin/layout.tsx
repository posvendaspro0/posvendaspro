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
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

