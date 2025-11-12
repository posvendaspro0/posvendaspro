'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  AlertCircle, 
  BarChart3,
  Link as LinkIcon,
  Users
} from 'lucide-react';

/**
 * Sidebar do Dashboard CLIENT
 * Navegação lateral com links ativos
 */

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    icon: AlertCircle,
  },
  {
    name: 'Operadores',
    href: '/dashboard/operadores',
    icon: Users,
  },
  {
    name: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
  },
  {
    name: 'Integração ML',
    href: '/dashboard/integracao',
    icon: LinkIcon,
  },
];

export function DashboardSidebar() {
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
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
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
          Dashboard Cliente
        </p>
      </div>
    </div>
  );
}

