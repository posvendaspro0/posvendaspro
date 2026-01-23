import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken } from "@/services/mercadolivre-service";
import { fetchAllClaims } from "@/services/claims-fetcher";
import { persistClaims } from "@/services/ml-claims-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const accounts = await prisma.mlAccount.findMany({
    where: { isActive: true },
  });

  let totalUpdated = 0;
  let totalAccounts = 0;

  for (const account of accounts) {
    totalAccounts += 1;
    const accessToken = await getValidAccessToken(account.companyId);
    if (!accessToken) {
      continue;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const effectiveConnectedAt =
      account.connectedAt && account.connectedAt.getTime() <= now.getTime()
        ? account.connectedAt
        : sevenDaysAgo;

    const result = await fetchAllClaims({
      accessToken,
      userId: account.mercadoLivreUserId,
      connectedAt: effectiveConnectedAt,
    });

    await persistClaims(prisma, account.companyId, result.claims);
    totalUpdated += result.claims.length;
  }

  return NextResponse.json({
    ok: true,
    totalAccounts,
    totalUpdated,
  });
}
