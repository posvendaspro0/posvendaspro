import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Helpers para proteção de rotas
 * Usados em Server Components
 */

/**
 * Requer que o usuário esteja autenticado
 * Redireciona para login se não estiver
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return session;
}

/**
 * Requer que o usuário seja ADMIN
 * Redireciona para dashboard apropriado se não for
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return session;
}

/**
 * Requer que o usuário seja CLIENT
 * Redireciona para dashboard apropriado se não for
 */
export async function requireClient() {
  const session = await requireAuth();
  
  if (session.user.role !== 'CLIENT') {
    redirect('/admin');
  }
  
  return session;
}

