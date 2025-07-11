import { faker } from '@faker-js/faker';
import { PrismaClient, Role, UserStatus, CategoryType, EmployeeStatus, PerformanceRating, TaskStatus, TransactionType, TransactionStatus, DealStage } from '@/generated/prisma';
import { subMonths, addMonths } from 'date-fns';

const prisma = new PrismaClient();

// Helper Functions for Date Generation
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
  const kireghaCorp = await prisma.company.create({
    data: {
      name: 'Kiregha Corp',
      description: faker.company.catchPhrase(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      website: faker.internet.url(),
      timezone: faker.location.timeZone(),
      dateFormat: 'YYYY-MM-DD',
      industry: 'Technology',
      foundedDate: faker.date.past({ years: 10 }),
      employeeCount: faker.number.int({ min: 50, max: 500 }),
      taxId: faker.string.alphanumeric({ length: 10 }),
      addressLine1: faker.location.streetAddress(),
      addressLine2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
      forecastedRevenue: faker.number.float({ min: 100000, max: 1000000, fractionDigits: 2 }),
      forecastedExpenses: faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 }),
    },
  });
  companies.push(kireghaCorp);

  for (let i = 0; i < 2; i++) {
    const comp = await prisma.company.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        contactEmail: faker.internet.email(),
        contactPhone: faker.phone.number(),
        website: faker.internet.url(),
        timezone: faker.location.timeZone(),
        dateFormat: 'YYYY-MM-DD',
        industry: faker.helpers.arrayElement(['Finance', 'Healthcare', 'Retail']),
        foundedDate: faker.date.past({ years: 10 }),
        employeeCount: faker.number.int({ min: 10, max: 200 }),
        taxId: faker.string.alphanumeric({ length: 10 }),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
        forecastedRevenue: faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 }),
        forecastedExpenses: faker.number.float({ min: 20000, max: 200000, fractionDigits: 2 }),
      },
    });
    companies.push(comp);
  }
  console.log(`✅ Created ${companies.length} companies.`);

  // **2. Create Images for Companies**
  const images = [];
  for (const comp of companies) {
    const image = await prisma.image.create({
      data: {
        url: faker.image.urlPicsumPhotos(),
        pathname: `companies/${comp.id}/logo`,
        contentType: 'image/jpeg',
        size: faker.number.int({ min: 100000, max: 1000000 }),
        uploadedAt: randomDateInPastFourMonths(),
        companyId: comp.id,
      },
    });
    images.push(image);
  }

  // **3. Create Users**
  const users = [];
  for (const comp of companies) {
    const userCount = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < userCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          password: faker.internet.password({ length: 12 }),
          role: faker.helpers.arrayElement([Role.ADMIN, Role.USER, Role.MEMBER]),
          status: faker.helpers.arrayElement([UserStatus.ACCEPTED, UserStatus.PENDING, UserStatus.BLOCKED]),
          companyId: comp.id,
          currentCompanyId: comp.id,
          createdAt: randomDateInPastFourMonths(),
        },
      });
      users.push(user);

      // Create profile image for user
      const userImage = await prisma.image.create({
        data: {
          url: faker.image.urlPicsumPhotos(),
          pathname: `users/${user.id}/profile`,
          contentType: 'image/jpeg',
          size: faker.number.int({ min: 100000, max: 1000000 }),
          uploadedAt: randomDateInPastFourMonths(),
          userId: user.id,
        },
      });
      images.push(userImage);
    }
  }
  console.log(`✅ Created ${users.length} users with profile images.`);

  // **4. Create Workspaces**
  const workspaces = [];
  for (const comp of companies) {
    const workspaceCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < workspaceCount; i++) {
      const wsImage = await prisma.image.create({
        data: {
          url: faker.image.urlPicsumPhotos(),
          pathname: `workspaces/${comp.id}/${faker.string.uuid()}`,
          contentType: 'image/jpeg',
          size: faker.number.int({ min: 100000, max: 1000000 }),
          uploadedAt: randomDateInPastFourMonths(),
          companyId: comp.id,
        },
      });
      const ws = await prisma.workspace.create({
        data: {
          name: `${faker.hacker.noun()} Workspace`,
          companyId: comp.id,
          inviteCode: faker.string.uuid(),
          createdAt: randomDateInPastFourMonths(),
          updatedAt: randomDateInPastFourMonths(),
          images: { connect: { id: wsImage.id } },
        },
      });
      workspaces.push(ws);

      // Add members to workspace
      const companyUsers = users.filter(u => u.companyId === comp.id);
      const memberCount = Math.min(faker.number.int({ min: 2, max: 4 }), companyUsers.length);
      const selectedUsers = faker.helpers.shuffle(companyUsers).slice(0, memberCount);
      for (const user of selectedUsers) {
        await prisma.member.create({
          data: {
            userId: user.id,
            workspaceId: ws.id,
            name: user.name || 'Anonymous Member',
            email: user.email || 'anonymous@example.com',
            role: faker.helpers.arrayElement([Role.ADMIN, Role.MEMBER]),
            color: faker.color.rgb(),
            createdAt: randomDateInPastFourMonths(),
          },
        });
      }
    }
  }
  console.log(`✅ Created ${workspaces.length} workspaces with members.`);

  // **5. Create Projects**
  const projects = [];
  for (const ws of workspaces) {
    const projectCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < projectCount; i++) {
      const projImage = await prisma.image.create({
        data: {
          url: faker.image.urlPicsumPhotos(),
          pathname: `projects/${ws.id}/${faker.string.uuid()}`,
          contentType: 'image/jpeg',
          size: faker.number.int({ min: 100000, max: 1000000 }),
          uploadedAt: randomDateInPastFourMonths(),
          companyId: ws.companyId,
        },
      });
      const proj = await prisma.project.create({
        data: {
          name: `${faker.hacker.noun()} Project`,
          workspaceId: ws.id,
          createdAt: randomDateInPastFourMonths(),
          updatedAt: randomDateInPastFourMonths(),
          images: { connect: { id: projImage.id } },
        },
      });
      projects.push(proj);
    }
  }
  console.log(`✅ Created ${projects.length} projects.`);

  // **6. Create Tasks**
  for (const proj of projects) {
    const wsMembers = await prisma.member.findMany({
      where: {
        workspaceId: proj.workspaceId
      }, include : {
        workspace : {
          select : { companyId : true}
        }
      }
    });
    const taskCount = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < taskCount; i++) {
      const assignee = wsMembers.length > 0 ? faker.helpers.arrayElement(wsMembers) : null;
      await prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.sentence(),
          status: faker.helpers.enumValue(TaskStatus),
          createdAt: randomDateInPastFourMonths(),
          dueDate: randomDueDate(),
          projectId: proj.id,
          workspaceId: proj.workspaceId,
          assigneeId: assignee?.id,
          companyId: wsMembers[0]?.workspace.companyId,
          position: faker.number.int({ min: 1, max: 100 }),
        },
      });
    }
  }
  console.log(`✅ Created tasks for ${projects.length} projects.`);

  // **7. Create Categories**
  const categories = [];
  for (const comp of companies) {
    const incomeCats = ['Sales', 'Services', 'Other Income'];
    const expenseCats = ['Rent', 'Salaries', 'Supplies'];
    for (const name of incomeCats) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: CategoryType.INCOME,
          budgetLimit: faker.number.float({ min: 10000, max: 30000, fractionDigits: 2 }),
          budgetUsed: 0,
          companyId: comp.id,
        },
      });
      categories.push(cat);
    }
    for (const name of expenseCats) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: CategoryType.EXPENSE,
          budgetLimit: faker.number.float({ min: 5000, max: 20000, fractionDigits: 2 }),
          budgetUsed: 0,
          companyId: comp.id,
        },
      });
      categories.push(cat);
    }
  }
  console.log(`✅ Created ${categories.length} categories.`);

  // **8. Create Transactions**
  for (const comp of companies) {
    const companyUsers = users.filter(u => u.companyId === comp.id);
    const companyCats = categories.filter(c => c.companyId === comp.id);
    const txCount = faker.number.int({ min: 20, max: 40 });
    for (let i = 0; i < txCount; i++) {
      const user = faker.helpers.arrayElement(companyUsers);
      const cat = faker.helpers.arrayElement(companyCats);
      await prisma.transaction.create({
        data: {
          amount: faker.number.float({ min: 10, max: 2000, fractionDigits: 2 }),
          date: randomDateInPastFourMonths(),
          description: faker.commerce.productDescription(),
          type: faker.helpers.enumValue(TransactionType),
          status: faker.helpers.enumValue(TransactionStatus),
          userId: user.id,
          companyId: comp.id,
          categoryId: cat.id,
          createdAt: randomDateInPastFourMonths(),
        },
      });
    }
  }
  console.log(`✅ Created transactions for ${companies.length} companies.`);

  // **9. Update Categories' budgetUsed**
  for (const cat of categories) {
    const agg = await prisma.transaction.aggregate({
      where: { categoryId: cat.id },
      _sum: { amount: true },
    });
    await prisma.category.update({
      where: { id: cat.id },
      data: { budgetUsed: agg._sum.amount || 0 },
    });
  }
  console.log(`✅ Updated budgetUsed for ${categories.length} categories.`);

  // **10. Create Reports**
  for (const comp of companies) {
    const companyUsers = users.filter(u => u.companyId === comp.id);
    const reportCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < reportCount; i++) {
      const user = companyUsers.length > 0 ? faker.helpers.arrayElement(companyUsers) : null;
      const startDate = randomDateInPastFourMonths();
      await prisma.report.create({
        data: {
          title: `${faker.hacker.noun()} Report`,
          fileUrl: faker.internet.url(),
          startDate,
          endDate: faker.date.between({ from: startDate, to: new Date() }),
          createdAt: randomDateInPastFourMonths(),
          companyId: comp.id,
          userId: user?.id,
        },
      });
    }
  }
  console.log(`✅ Created reports for ${companies.length} companies.`);

  // **11. Create Products**
  for (const comp of companies) {
    const productCount = faker.number.int({ min: 5, max: 10 });
    for (let i = 0; i < productCount; i++) {
      await prisma.product.create({
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
    }
  }
  console.log(`✅ Created products for ${companies.length} companies.`);

  // **12. Create Customers**
  for (const comp of companies) {
    const customerCount = faker.number.int({ min: 3, max: 6 });
    for (let i = 0; i < customerCount; i++) {
      await prisma.customer.create({
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
    }
  }
  console.log(`✅ Created customers for ${companies.length} companies.`);

  // **13. Create Departments**
  const departments = [];
  for (const comp of companies) {
    const deptCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < deptCount; i++) {
      const dept = await prisma.department.create({
        data: {
          name: `${faker.company.buzzAdjective()} Dept.`,
          description: faker.company.catchPhrase(),
          companyId: comp.id,
        },
      });
      departments.push(dept);
    }
  }
  console.log(`✅ Created ${departments.length} departments.`);

  // **14. Create Employees**
  const employees = [];
  for (const dept of departments) {
    const empCount = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < empCount; i++) {
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
      employees.push(emp);
    }
  }
  console.log(`✅ Created ${employees.length} employees.`);

  // **15. Link Some Users to Employees**
  for (const emp of employees) {
    const companyUsers = users.filter(u => u.companyId === emp.companyId && !u.employeeId);
    if (companyUsers.length > 0) {
      const user = faker.helpers.arrayElement(companyUsers);
      await prisma.user.update({
        where: { id: user.id },
        data: { employeeId: emp.id },
      });
    }
  }
  console.log(`✅ Linked some users to employees.`);

  // **16. Create Payrolls**
  for (const emp of employees) {
    const payrollCount = faker.number.int({ min: 3, max: 4 });
    for (let i = 0; i < payrollCount; i++) {
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
    }
  }
  console.log(`✅ Created payrolls for ${employees.length} employees.`);

  // **17. Create Performance Reviews**
  for (const emp of employees) {
    const reviewCount = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < reviewCount; i++) {
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
    }
  }
  console.log(`✅ Created performance reviews for ${employees.length} employees.`);

  // **18. Create Documents**
  for (const emp of employees) {
    const docCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < docCount; i++) {
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
    }
  }
  console.log(`✅ Created documents for ${employees.length} employees.`);

  // **19. Create Audit Logs**
  for (const user of users) {
    const logCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < logCount; i++) {
      await prisma.auditLog.create({
        data: {
          action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE']),
          entity: faker.helpers.arrayElement(['User', 'Transaction', 'Product']),
          entityId: faker.string.uuid(),
          userId: user.id,
          description: faker.lorem.sentence(),
          url: `https://app.example.com/${faker.lorem.word()}`,
          companyId: user.companyId,
          timestamp: randomDateInPastFourMonths(),
        },
      });
    }
  }
  console.log(`✅ Created audit logs for ${users.length} users.`);

  // **20. Create Notifications**
  for (const user of users) {
    const notifCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < notifCount; i++) {
      await prisma.notification.create({
        data: {
          message: faker.lorem.sentence(),
          type: faker.helpers.arrayElement(['INFO', 'WARNING', 'ALERT']),
          userId: user.id,
          createdAt: randomDateInPastFourMonths(),
        },
      });
    }
  }
  console.log(`✅ Created notifications for ${users.length} users.`);

  // **21. Create Contacts**
  const contacts = [];
  for (const comp of companies) {
    const contactCount = faker.number.int({ min: 3, max: 6 });
    for (let i = 0; i < contactCount; i++) {
      const contact = await prisma.contact.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          companyName: faker.company.name(),
          jobTitle: faker.person.jobTitle(),
          notes: faker.lorem.paragraph(),
          createdAt: randomDateInPastFourMonths(),
          updatedAt: randomDateInPastFourMonths(),
          companyId: comp.id,
        },
      });
      contacts.push(contact);
    }
  }
  console.log(`✅ Created ${contacts.length} contacts.`);

  // **22. Create Deals**
  for (const contact of contacts) {
    const dealCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < dealCount; i++) {
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
          updatedAt: randomDateInPastFourMonths(),
        },
      });
    }
  }
  console.log(`✅ Created deals for ${contacts.length} contacts.`);

  // **23. Create Communication Logs**
  const deals = await prisma.deal.findMany();
  for (const deal of deals) {
    const logCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < logCount; i++) {
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
    }
  }
  console.log(`✅ Created communication logs for ${deals.length} deals.`);

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