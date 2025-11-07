'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings,
  BarChart3
} from 'lucide-react';

/**
 * Sidebar do Dashboard ADMIN
 * Navegação lateral com links ativos
 */

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Empresas',
    href: '/admin/empresas',
    icon: Building2,
  },
  {
    name: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    name: 'Relatórios',
    href: '/admin/relatorios',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">PósVendas Pro</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-slate-800 p-4">
        <p className="text-xs text-slate-400 text-center">
          Admin Dashboard
        </p>
      </div>
    </div>
  );
}

