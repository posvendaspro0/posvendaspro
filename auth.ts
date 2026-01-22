import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';

/**
 * Configuração principal do NextAuth.js v5
 * Provider: Credentials (email + senha)
 * SEM middleware - proteção em nível de componente
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error('E-mail e senha são obrigatórios');
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            company: true,
          },
        });

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        // Verificar senha
        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas');
        }

        // Retornar dados do usuário para a sessão
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Adicionar dados customizados ao token na primeira autenticação
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      // Adicionar dados customizados à sessão
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'CLIENT';
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 dias
    updateAge: 24 * 60 * 60, // renova a sessão a cada 24h
  },
  jwt: {
    maxAge: 90 * 24 * 60 * 60, // 90 dias
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});

