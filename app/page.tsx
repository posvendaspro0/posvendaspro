import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Página Inicial
 * Redireciona para o dashboard apropriado baseado no role do usuário
 * ou para login se não estiver autenticado
 */
export default async function Home() {
  const session = await auth().catch(() => null);

  if (!session?.user) {
    redirect('/login');
  }

  // Redirecionar baseado no role
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  redirect('/dashboard');
}
