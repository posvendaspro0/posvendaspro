'use client';

import { signOut } from 'next-auth/react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

/**
 * Botão de Sign Out
 * Usado nos menus dropdown
 */
export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </DropdownMenuItem>
  );
}

