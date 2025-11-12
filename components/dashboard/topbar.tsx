import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, User, Settings } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import Link from 'next/link';

/**
 * Topbar do Dashboard CLIENT
 * Header com informações do usuário e empresa
 */
export async function DashboardTopbar() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  // Buscar dados da empresa
  const company = session.user.companyId
    ? await prisma.company.findUnique({
        where: { id: session.user.companyId },
      })
    : null;

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CL';

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-slate-600" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {company?.name || 'Empresa'}
          </h2>
          <p className="text-xs text-slate-500">{company?.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-slate-500">Cliente</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/perfil">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/configuracoes">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

