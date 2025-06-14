import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Upsert the company record using a unique ID
  const company = await prisma.company.upsert({
    where: { id: 'unique-company-id' }, // Ensure this ID is unique for the company
    update: {}, // Update logic can be added here if needed
    create: {
      name: 'Lachs Golden & Co',
      contactEmail: 'contact@lachsgolden.com',
      timezone: 'UTC-05:00',
      dateFormat: 'YYYY-MM-DD',
    },
  });

  // Upsert the department record using a unique ID
  const dept = await prisma.department.upsert({
    where: { id: 'unique-department-id' }, // Ensure this ID is unique for the department
    update: {}, // Update logic can be added here if needed
    create: {
      id: 'unique-department-id', // Explicitly provide the ID if required
      name: 'General',
      companyId: company.id,
    },
  });

  // Upsert the employee record using a unique email
  const employee = await prisma.employee.upsert({
    where: { email: 'admin@lachsgolden.com' }, // Email is used as a unique identifier
    update: {}, // Update logic can be added here if needed
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lachsgolden.com',
      jobTitle: 'Administrator',
      status: 'ACTIVE',
      departmentId: dept.id,
      companyId: company.id,
      hireDate: new Date(),
      salary: 0,
    },
  });

  // Upsert the user record using a unique email
  await prisma.user.upsert({
    where: { email: 'admin@lachsgolden.com' }, // Email is used as a unique identifier
    update: {}, // Update logic can be added here if needed
    create: {
      email: 'admin@lachsgolden.com',
      name: 'Admin User',
      role: 'ADMIN',
      
      companyId: company.id,
      employeeId: employee.id,
    },
  });

  console.log('Seed completed');
}

main()
  .then(() => {
    console.log('🌱 Seeding completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
