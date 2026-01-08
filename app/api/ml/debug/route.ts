import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth-helpers';
import { getMlAccountByCompanyId } from '@/services/mercadolivre-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireClient();
    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'No company ID' });
    }

    const mlAccount = await getMlAccountByCompanyId(companyId);

    if (!mlAccount) {
      return NextResponse.json({ 
        connected: false,
        message: 'Nenhuma conta ML conectada' 
      });
    }

    return NextResponse.json({
      connected: true,
      debug: {
        companyId: mlAccount.companyId,
        mercadoLivreUserId: mlAccount.mercadoLivreUserId,
        connectedAt: mlAccount.connectedAt,
        connectedAtISO: mlAccount.connectedAt?.toISOString(),
        connectedAtType: typeof mlAccount.connectedAt,
        expiresAt: mlAccount.expiresAt,
        isActive: mlAccount.isActive,
        createdAt: mlAccount.createdAt,
        updatedAt: mlAccount.updatedAt,
        
        // Comparações úteis
        now: new Date().toISOString(),
        isConnectedAtOld: mlAccount.connectedAt ? 
          (new Date().getTime() - new Date(mlAccount.connectedAt).getTime()) > (24 * 60 * 60 * 1000) : 
          null,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
