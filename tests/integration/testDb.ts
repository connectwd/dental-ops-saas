import { prisma } from "@/infrastructure/db/prisma";

// Truncate in FK-safe order. CASCADE is unnecessary here since we always
// truncate every table together, but RESTART IDENTITY keeps runs clean.
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Membership", "User", "PracticeSite", "Organisation" RESTART IDENTITY CASCADE'
  );
}

export async function seedTenant() {
  const org = await prisma.organisation.create({
    data: { name: "Test Dental Practice" },
  });

  const site = await prisma.practiceSite.create({
    data: { organisationId: org.id, name: "Test Site" },
  });

  const manager = await prisma.user.create({
    data: { email: "manager@test.local", displayName: "Test Manager" },
  });

  const staff = await prisma.user.create({
    data: { email: "staff@test.local", displayName: "Test Staff" },
  });

  await prisma.membership.create({
    data: { userId: manager.id, practiceSiteId: site.id, role: "MANAGER" },
  });

  await prisma.membership.create({
    data: { userId: staff.id, practiceSiteId: site.id, role: "STAFF" },
  });

  return { org, site, manager, staff };
}
