import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organisation.upsert({
    where: { id: "seed-org-1" },
    update: {},
    create: { id: "seed-org-1", name: "Example Dental Practice Ltd" },
  });

  const site = await prisma.practiceSite.upsert({
    where: { id: "seed-site-1" },
    update: {},
    create: {
      id: "seed-site-1",
      organisationId: org.id,
      name: "Example Dental — Main Site",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example-dental.co.uk" },
    update: {},
    create: { email: "manager@example-dental.co.uk", displayName: "Priya Manager" },
  });

  const staff = await prisma.user.upsert({
    where: { email: "nurse@example-dental.co.uk" },
    update: {},
    create: { email: "nurse@example-dental.co.uk", displayName: "Sam Nurse" },
  });

  await prisma.membership.upsert({
    where: { userId_practiceSiteId: { userId: manager.id, practiceSiteId: site.id } },
    update: {},
    create: { userId: manager.id, practiceSiteId: site.id, role: "MANAGER" },
  });

  await prisma.membership.upsert({
    where: { userId_practiceSiteId: { userId: staff.id, practiceSiteId: site.id } },
    update: {},
    create: { userId: staff.id, practiceSiteId: site.id, role: "STAFF" },
  });

  console.log("Seed complete:", { org: org.name, site: site.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
