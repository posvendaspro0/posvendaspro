import type { PrismaClient } from "@prisma/client";

export async function persistClaims(
  prisma: PrismaClient,
  companyId: string,
  claims: any[]
) {
  const retentionDate = new Date();
  retentionDate.setMonth(retentionDate.getMonth() - 12);

  const chunkSize = 200;
  for (let i = 0; i < claims.length; i += chunkSize) {
    const chunk = claims.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((claim: any) => {
        const mlClaimId = String(claim.id);
        const resourceId = claim.resource_id
          ? String(claim.resource_id)
          : claim.resource?.id
          ? String(claim.resource?.id)
          : null;
        const orderId = claim.order_id
          ? String(claim.order_id)
          : claim.resource === "order"
          ? resourceId
          : null;
        const dateCreated = claim.date_created
          ? new Date(claim.date_created)
          : null;
        const lastUpdated = claim.last_updated
          ? new Date(claim.last_updated)
          : null;
        const dateClosed = claim.resolution?.date_created
          ? new Date(claim.resolution.date_created)
          : claim.date_closed
          ? new Date(claim.date_closed)
          : null;

        return prisma.mlClaim.upsert({
          where: {
            companyId_mlClaimId: {
              companyId,
              mlClaimId,
            },
          },
          update: {
            status: claim.status || null,
            stage: claim.stage || null,
            type: claim.type || null,
            resource: claim.resource || null,
            resourceId,
            orderId,
            reasonId: claim.reason_id || null,
            siteId: claim.site_id || null,
            dateCreated,
            lastUpdated,
            dateClosed,
            raw: claim,
          },
          create: {
            companyId,
            mlClaimId,
            status: claim.status || null,
            stage: claim.stage || null,
            type: claim.type || null,
            resource: claim.resource || null,
            resourceId,
            orderId,
            reasonId: claim.reason_id || null,
            siteId: claim.site_id || null,
            dateCreated,
            lastUpdated,
            dateClosed,
            raw: claim,
          },
        });
      })
    );
  }

  await prisma.mlClaim.deleteMany({
    where: {
      companyId,
      dateCreated: {
        lt: retentionDate,
      },
    },
  });
}
