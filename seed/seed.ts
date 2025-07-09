// prisma/seed.ts
import { faker } from '@faker-js/faker';
import { PrismaClient, EmployeeStatus, PerformanceRating, TaskStatus, DealStage, Role, TransactionType, TransactionStatus } from '@/generated/prisma';
import { subMonths, addMonths } from 'date-fns';

const prisma = new PrismaClient();

// **Helper Functions for Date Generation**
const fourMonthsAgo = subMonths(new Date(), 4);
const oneMonthFuture = addMonths(new Date(), 1);

function randomDateInPastFourMonths() {
  return faker.date.between({ from: fourMonthsAgo, to: new Date() });
}

function randomDueDate() {
  return faker.date.between({ from: subMonths(new Date(), 1), to: oneMonthFuture });
}

async function main() {
  console.log('🔄 Start full seeding…');

  // **1. Create Companies**
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

  // **2. Create Users**
  const users: Array<{ id: string; companyId: string, name: string | null; email?: string }> = [];
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
          role: faker.helpers.arrayElement(['USER', 'ADMIN'] as const),
          companyId: comp.id,
        },
      });
      users.push({ id: user.id, companyId: comp.id, name: user?.name, email: user.email });
    }
  }
  console.log(`✅ Created ${users.length} users.`);

  // **3. Create Categories**
  const categories: Array<{ id: string; companyId: string }> = [];
  const incomeCats = ['Sales', 'Services', 'Other Income'];
  const expenseCats = ['Rent', 'Salaries', 'Supplies'];
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

  // **4. Create Products**
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
          createdAt: randomDateInPastFourMonths(),
          companyId: comp.id,
        },
      });
      products.push({ id: prod.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${products.length} products.`);

  // **5. Create Customers**
  const customers: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const count = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < count; i++) {
      const cust = await prisma.customer.create({
        data: {
          name: faker.company.name(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          lastContacted: randomDateInPastFourMonths(),
          notes: faker.lorem.sentence(),
          createdAt: randomDateInPastFourMonths(),
          companyId: comp.id,
        },
      });
      customers.push({ id: cust.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${customers.length} customers.`);

  // **6. Create Departments**
  const departments: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const deptCount = faker.number.int({ min: 2, max: 3 });
    for (let d = 0; d < deptCount; d++) {
      const dept = await prisma.department.create({
        data: {
          name: `${faker.company.buzzAdjective()} Dept.`,
          description: faker.company.catchPhrase(),
          companyId: comp.id,
        },
      });
      departments.push({ id: dept.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${departments.length} departments.`);

  // **7. Create Employees**
  const employees: Array<{ id: string; companyId: string; departmentId: string }> = [];
  for (const dept of departments) {
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
          companyId: dept.companyId,
          status: faker.helpers.enumValue(EmployeeStatus),
          hireDate: randomDateInPastFourMonths(),
          jobTitle: faker.person.jobTitle(),
          salary: faker.number.float({ min: 30000, max: 100000, fractionDigits: 2 }),
          createdAt: randomDateInPastFourMonths(),
        },
      });
      employees.push({ id: emp.id, companyId: dept.companyId, departmentId: dept.id });
    }
  }
  console.log(`✅ Created ${employees.length} employees.`);

  // **8. Link Some Users to Employees**
  for (const emp of employees) {
    const companyUsers = users.filter(u => u.companyId === emp.companyId);
    if (companyUsers.length > 0) {
      const user = faker.helpers.arrayElement(companyUsers);
      await prisma.user.update({
        where: { id: user.id },
        data: { employeeId: emp.id },
      });
    }
  }
  console.log('🔄 Linked some users to employees.');

  // **9. Create Payrolls**
  let payrollCount = 0;
  for (const emp of employees) {
    const payPeriodCount = faker.number.int({ min: 3, max: 4 }); // 3-4 months of payrolls
    for (let i = 0; i < payPeriodCount; i++) {
      const month = subMonths(new Date(), i);
      await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          companyId: emp.companyId,
          payPeriod: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
          grossAmount: faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 }),
          netAmount: faker.number.float({ min: 800, max: 4500, fractionDigits: 2 }),
          taxAmount: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
          issuedDate: randomDateInPastFourMonths(),
          notes: faker.lorem.sentence(),
          createdAt: randomDateInPastFourMonths(),
        },
      });
      payrollCount++;
    }
  }
  console.log(`✅ Created ${payrollCount} payroll records.`);

  // **10. Create Performance Reviews**
  let reviewCount = 0;
  for (const emp of employees) {
    const cnt = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < cnt; i++) {
      const companyUsers = users.filter(u => u.companyId === emp.companyId);
      const reviewer = companyUsers.length > 0 ? faker.helpers.arrayElement(companyUsers) : null;
      await prisma.performanceReview.create({
        data: {
          employeeId: emp.id,
          companyId: emp.companyId,
          rating: faker.helpers.enumValue(PerformanceRating),
          comments: faker.lorem.sentences(2),
          reviewDate: randomDateInPastFourMonths(),
          reviewerId: reviewer?.id,
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ Created ${reviewCount} performance reviews.`);

  // **11. Create Documents**
  let docCount = 0;
  for (const emp of employees) {
    const dcnt = faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < dcnt; i++) {
      await prisma.document.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          fileUrl: faker.internet.url(),
          uploadedAt: randomDateInPastFourMonths(),
          ownerId: emp.id,
          companyId: emp.companyId,
        },
      });
      docCount++;
    }
  }
  console.log(`✅ Created ${docCount} documents.`);

  // **12. Create Workspaces**
  const workspaces: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const workspaceCount = faker.number.int({ min: 1, max: 2 });
    for (let w = 0; w < workspaceCount; w++) {
      const ws = await prisma.workspace.create({
        data: {
          name: `${faker.hacker.noun()} Workspace`,
          companyId: comp.id,
          imageUrl: faker.image.url(),
          createdAt: randomDateInPastFourMonths(),
        },
      });
      workspaces.push({ id: ws.id, companyId: comp.id });

      // Add members to workspace
      const companyUsers = users.filter(u => u.companyId === comp.id);
      const memberCount = faker.number.int({ min: 2, max: 4 });
      const selectedUsers = faker.helpers.shuffle(companyUsers).slice(0, memberCount);
      for (const user of selectedUsers) {
        await prisma.member.create({
          data: {
            userId: user.id,
            workspaceId: ws.id,
            name : user.name || "Anonymous Member",
            email : user.email || "anonymous.email@example.com",
            role: faker.helpers.arrayElement(['ADMIN', 'MEMBER'] as const),
            color: faker.color.rgb(),
            createdAt: randomDateInPastFourMonths(),
          },
        });
      }
    }
  }
  console.log(`✅ Created ${workspaces.length} workspaces with members.`);

  // **13. Create Projects**
  const projects: Array<{ id: string; workspaceId: string }> = [];
  for (const ws of workspaces) {
    const projectCount = faker.number.int({ min: 1, max: 3 });
    for (let p = 0; p < projectCount; p++) {
      const proj = await prisma.project.create({
        data: {
          name: `${faker.hacker.noun()} Project`,
          workspaceId: ws.id,
          imageUrl: faker.image.url(),
          createdAt: randomDateInPastFourMonths(),
        },
      });
      projects.push({ id: proj.id, workspaceId: ws.id });
    }
  }
  console.log(`✅ Created ${projects.length} projects.`);

  // **14. Create Tasks**
  let taskCount = 0;
  for (const ws of workspaces) {
    const wsMembers = await prisma.member.findMany({ where: { workspaceId: ws.id } });
    const wsProjects = projects.filter(p => p.workspaceId === ws.id);
    if (wsProjects.length === 0 || wsMembers.length === 0) continue;

    const taskCountPerWorkspace = faker.number.int({ min: 5, max: 10 });
    for (let t = 0; t < taskCountPerWorkspace; t++) {
      const project = faker.helpers.arrayElement(wsProjects);
      const assignee = faker.helpers.arrayElement(wsMembers);
      await prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.sentence(),
          status: faker.helpers.enumValue(TaskStatus),
          createdAt: randomDateInPastFourMonths(),
          dueDate: randomDueDate(),
          projectId: project.id,
          workspaceId: ws.id,
          assigneeId: assignee.id,
          companyId: ws.companyId,
          position: faker.number.int({ min: 1, max: 100 }),
        },
      });
      taskCount++;
    }
  }
  console.log(`✅ Created ${taskCount} tasks.`);

  // **15. Create Contacts**
  const contacts: Array<{ id: string; companyId: string }> = [];
  for (const comp of companies) {
    const contactCount = faker.number.int({ min: 3, max: 5 });
    for (let c = 0; c < contactCount; c++) {
      const contact = await prisma.contact.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          companyName: faker.company.name(),
          jobTitle: faker.person.jobTitle(),
          notes: faker.lorem.paragraph(),
          createdAt: randomDateInPastFourMonths(),
          companyId: comp.id,
        },
      });
      contacts.push({ id: contact.id, companyId: comp.id });
    }
  }
  console.log(`✅ Created ${contacts.length} contacts.`);

  // **16. Create Deals**
  let dealCount = 0;
  for (const contact of contacts) {
    const dealCountPerContact = faker.number.int({ min: 0, max: 2 });
    for (let d = 0; d < dealCountPerContact; d++) {
      const companyUsers = users.filter(u => u.companyId === contact.companyId);
      const owner = companyUsers.length > 0 ? faker.helpers.arrayElement(companyUsers) : null;
      await prisma.deal.create({
        data: {
          title: `${faker.commerce.productName()} Deal`,
          amount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
          stage: faker.helpers.enumValue(DealStage),
          contactId: contact.id,
          ownerId: owner?.id,
          createdAt: randomDateInPastFourMonths(),
        },
      });
      dealCount++;
    }
  }
  console.log(`✅ Created ${dealCount} deals.`);

  // **17. Create Communication Logs**
  let logCount = 0;
  const deals = await prisma.deal.findMany();
  for (const deal of deals) {
    const logCountPerDeal = faker.number.int({ min: 1, max: 3 });
    for (let l = 0; l < logCountPerDeal; l++) {
      await prisma.communicationLog.create({
        data: {
          type: faker.helpers.arrayElement(['email', 'sms', 'call']),
          direction: faker.helpers.arrayElement(['inbound', 'outbound']),
          message: faker.lorem.sentence(),
          timestamp: randomDateInPastFourMonths(),
          dealId: deal.id,
          contactId: deal.contactId,
        },
      });
      logCount++;
    }
  }
  console.log(`✅ Created ${logCount} communication logs.`);

  // **18. Create Transactions**
  const txCount = 80;
  for (let i = 0; i < txCount; i++) {
    const u = faker.helpers.arrayElement(users);
    const cat = faker.helpers.arrayElement(
      categories.filter(c => c.companyId === u.companyId)
    );
    await prisma.transaction.create({
      data: {
        amount: faker.number.float({ min: 10, max: 2000, fractionDigits: 2 }),
        date: randomDateInPastFourMonths(),
        description: faker.commerce.productDescription(),
        type: faker.helpers.enumValue(TransactionType),
        status: faker.helpers.enumValue(TransactionStatus),
        userId: u.id,
        companyId: u.companyId,
        categoryId: cat.id,
        createdAt: randomDateInPastFourMonths(),
      },
    });
  }
  console.log(`✅ Created ${txCount} transactions.`);

  // **19. Update Categories' budgetUsed**
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

  // **20. Create Reports**
  let reportCount = 0;
  for (const comp of companies) {
    const reportCountPerCompany = faker.number.int({ min: 2, max: 3 });
    const companyUsers = users.filter(u => u.companyId === comp.id);
    for (let r = 0; r < reportCountPerCompany; r++) {
      const user = companyUsers.length > 0 ? faker.helpers.arrayElement(companyUsers) : null;
      const startDate = randomDateInPastFourMonths();
      const endDate = faker.date.between({ from: startDate, to: new Date() });
      await prisma.report.create({
        data: {
          title: `${faker.hacker.noun()} Report`,
          fileUrl: faker.internet.url(),
          startDate,
          endDate,
          createdAt: randomDateInPastFourMonths(),
          companyId: comp.id,
          userId: user?.id,
        },
      });
      reportCount++;
    }
  }
  console.log(`✅ Created ${reportCount} reports.`);

  // **21. Create Audit Logs**
  let logCountAudit = 0;
  for (const u of users.slice(0, 5)) {
    for (let i = 0; i < 2; i++) {
      await prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE']),
          entity: faker.helpers.arrayElement(['Product', 'Category', 'Transaction']),
          entityId: faker.string.uuid(),
          userId: u.id,
          description: faker.lorem.sentence(),
          url: `https://app.example.com/${faker.lorem.word()}`,
          companyId: u.companyId,
          timestamp: randomDateInPastFourMonths(),
        },
      });
      logCountAudit++;
    }
  }
  console.log(`✅ Created ${logCountAudit} audit logs.`);

  // **22. Create Notifications**
  let noteCount = 0;
  for (const u of users) {
    await prisma.notification.create({
      data: {
        message: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['INFO', 'WARNING', 'ALERT']),
        userId: u.id,
        createdAt: randomDateInPastFourMonths(),
      },
    });
    noteCount++;
  }
  console.log(`✅ Created ${noteCount} notifications.`);

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