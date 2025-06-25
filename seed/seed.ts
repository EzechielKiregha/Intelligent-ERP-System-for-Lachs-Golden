// prisma/seed.ts
import { PerformanceRating, PrismaClient, TaskStatus } from '@/generated/prisma';
import { faker } from '@faker-js/faker';
import { connect } from 'http2';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Start full seeding…');

  // 1) Companies
  const companies = [];
  for (let i = 0; i < 2; i++) {
    const comp = await prisma.company.create({
      data: {
        name: i === 0 ? 'Kiregha Corp' : faker.company.name(),
        description: faker.company.catchPhrase(),
        contactEmail: faker.internet.email(),
        timezone: faker.location.timeZone(),
        dateFormat: 'YYYY-MM-DD',
        forecastedRevenue: faker.number.float({ min: 50_000, max: 100_000, fractionDigits: 2 }),
        forecastedExpenses: faker.number.float({ min: 20_000, max: 50_000, fractionDigits: 2 }),
      },
    });
    companies.push(comp);
  }
  console.log(`✅ Created ${companies.length} companies.`);

  // 2) Users
  const users: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const count = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          password: faker.internet.password({ length: 12 }),
          role: faker.helpers.arrayElement(['USER','ADMIN'] as const),
          companyId: comp.id,
        },
      });
      users.push({ id: user.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${users.length} users.`);

  // 3) Categories (3 INCOME, 3 EXPENSE per company)
  const categories: Array<{ id: string; companyId: string }> = [];
  const incomeCats = ['Sales','Services','Other Income'];
  const expenseCats = ['Rent','Salaries','Supplies'];
  for (const comp of companies) {
    for (const name of incomeCats) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: 'INCOME',
          budgetLimit: faker.number.float({ min: 10_000, max: 30_000, fractionDigits: 2 }),
          budgetUsed: 0,
          companyId: comp.id,
        },
      });
      categories.push({ id: cat.id, companyId: comp.id });
    }
    for (const name of expenseCats) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: 'EXPENSE',
          budgetLimit: faker.number.float({ min: 5_000, max: 20_000, fractionDigits: 2 }),
          budgetUsed: 0,
          companyId: comp.id,
        },
      });
      categories.push({ id: cat.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${categories.length} categories.`);

  // 4) Products (5–8 per company)
  const products: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const count = faker.number.int({ min: 5, max: 8 });
    for (let i = 0; i < count; i++) {
      const prod = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          sku: faker.string.alphanumeric({ length: 8 }),
          unitPrice: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
          quantity: faker.number.int({ min: 0, max: 200 }),
          threshold: faker.number.int({ min: 5, max: 20 }),
          description: faker.commerce.productDescription(),
          companyId: comp.id,
        },
      });
      products.push({ id: prod.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${products.length} products.`);

  // 5) Customers (3–5 per company)
  const customers: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const count = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < count; i++) {
      const cust = await prisma.customer.create({
        data: {
          name: faker.company.name(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          lastContacted: faker.date.past({ years: 1 }),
          notes: faker.lorem.sentence(),
          companyId: comp.id,
        },
      });
      customers.push({ id: cust.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${customers.length} customers.`);

  // 6) Departments & Employees
  const employees: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    // 2–3 departments
    const deptCount = faker.number.int({ min: 2, max: 3 });
    for (let d = 0; d < deptCount; d++) {
      const dept = await prisma.department.create({
        data: {
          name: `${faker.company.buzzAdjective()} Dept.`,
          companyId: comp.id,
        },
      });
      // 2–4 employees per department
      const empCount = faker.number.int({ min: 2, max: 4 });
      for (let e = 0; e < empCount; e++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const emp = await prisma.employee.create({
          data: {
            firstName,
            lastName,
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            departmentId: dept.id,
            companyId: comp.id,
          },
        });
        employees.push({ id: emp.id, companyId: comp.id });
      }
    }
  }
  console.log(`✅ Created ${employees.length} employees across departments.`);

  // 7) Payrolls (1 per employee)
  const paysDates = ["2025-03","2025-04","2025-05","2025-06","2025-02"] as const
  let payrollCount = 0;
  for (const emp of employees) {
    const pay = await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        companyId: emp.companyId,
        payPeriod: faker.helpers.arrayElement(paysDates),
        grossAmount: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
        issuedDate: faker.date.recent({ days: 30 }),
      },
    });
    payrollCount++;
  }
  console.log(`✅ Created ${payrollCount} payroll records.`);

  // 8) Reviews (1–2 per employee)
  let reviewCount = 0;
  for (const emp of employees) {
    const cnt = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < cnt; i++) {
      await prisma.performanceReview.create({
        data: {
          employeeId: emp.id,
          companyId: emp.companyId,
          rating: faker.helpers.enumValue(PerformanceRating),
          comments: faker.lorem.sentences(2),
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ Created ${reviewCount} performance reviews.`);

  // 9) Tasks & Documents (2–3 tasks & docs per employee)
  let taskCount = 0, docCount = 0;
  for (const emp of employees) {
    const tcnt = faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < tcnt; i++) {
      await prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.sentence(),
          dueDate: faker.date.soon({ days: 30 }),
          status: faker.helpers.enumValue(TaskStatus),
          assigneeId: emp.id,
          companyId: emp.companyId,
        },
      });
      taskCount++;
    }
    const dcnt = faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < dcnt; i++) {
      await prisma.document.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          fileUrl : faker.internet.url(),
          uploadedAt: faker.date.recent({ days: 15 }),
          ownerId: emp.id,
          companyId: emp.companyId,
        },
      });
      docCount++;
    }
  }
  console.log(`✅ Created ${taskCount} tasks and ${docCount} documents.`);

  // 10) Transactions (≤100 total)
  const txCount = 80;
  for (let i = 0; i < txCount; i++) {
    // pick random user + company
    const u = faker.helpers.arrayElement(users);
    const cat = faker.helpers.arrayElement(
      categories.filter(c => c.companyId === u.companyId)
    );
    await prisma.transaction.create({
      data: {
        amount: faker.number.float({ min: 10, max: 2000, fractionDigits: 2 }),
        date: faker.date.between({
          from: faker.date.recent({ days: 120 }),
          to: new Date(),
        }),
        description: faker.commerce.productDescription(),
        type: faker.helpers.arrayElement(['ORDER','PAYMENT','REFUND'] as const),
        status: faker.helpers.arrayElement(['PENDING','COMPLETED','FAILED','REFUNDED'] as const),
        userId: u.id,
        companyId: u.companyId,
        categoryId: cat.id,
      },
    });
  }
  console.log(`✅ Created ${txCount} transactions.`);

  // 11) Categories.budgetUsed update
  for (const cat of categories) {
    const agg = await prisma.transaction.aggregate({
      where: { categoryId: cat.id },
      _sum: { amount: true },
    });
    await prisma.category.update({
      where: { id: cat.id },
      data: { budgetUsed: agg._sum.amount ?? 0 },
    });
  }
  console.log('🔄 Updated budgetUsed on categories.');

  // 12) AuditLogs & Notifications
  let logCount = 0, noteCount = 0;
  for (const u of users.slice(0, 5)) {
    // 2 logs per user
    for (let i = 0; i < 2; i++) {
      await prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(['CREATE','UPDATE','DELETE']),
          entity: faker.helpers.arrayElement(['Product','Category','Transaction']),
          entityId: faker.string.uuid(),
          userId: u.id,
          description: faker.lorem.sentence(),
          url: `https://app.example.com/${faker.lorem.word()}`,
          companyId: u.companyId,
        },
      });
      logCount++;
    }
    // 1 notification per user
    await prisma.notification.create({
      data: {
        message: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['INFO','WARNING','ALERT']),
        userId: u.id,
      },
    });
    noteCount++;
  }
  console.log(`✅ Created ${logCount} audit logs and ${noteCount} notifications.`);

  console.log('🎉 Full seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
