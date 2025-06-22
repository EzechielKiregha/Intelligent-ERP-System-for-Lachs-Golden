import { PrismaClient } from '@/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding (lean dataset)…');

  // 1. Create a few Companies (e.g., 2)
  const companiesData = [
    {
      name: "Kiregha Corp",
      description: faker.company.catchPhrase(),
      contactEmail: faker.internet.email(),
      timezone: faker.location.timeZone(),
    },
    {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      contactEmail: faker.internet.email(),
      timezone: faker.location.timeZone(),
    },
  ];
  const companies = [];
  for (const compData of companiesData) {
    const comp = await prisma.company.create({
      data: {
        ...compData,
        // Provide numeric values for forecastedRevenue/forecastedExpenses
        forecastedRevenue: parseFloat(faker.finance.amount({min:50000, max:100000, dec:2})),
        forecastedExpenses: parseFloat(faker.finance.amount({min:20000, max:50000, dec:2})),
        dateFormat: 'YYYY-MM-DD', // Add a valid dateFormat value
      },
    });
    companies.push(comp);
  }
  console.log(`Created ${companies.length} companies.`);

  // 2. Create Users per Company (e.g., 2–3 each)
  const users: { id: string; companyId: string }[] = [];
  for (const company of companies) {
    const count = faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({firstName, lastName}).toLowerCase();
      const user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          // For testing: store plain or hashed password as needed.
          password: faker.internet.password({length:10}),
          role: 'USER',
          company: { connect: { id: company.id } },
        },
      });
      users.push({ id: user.id, companyId: company.id });
    }
  }
  console.log(`Created ${users.length} users.`);

  // 3. Create Categories per Company (e.g., 3 income, 3 expense each)
  const categories: { id: string; type: 'INCOME' | 'EXPENSE'; companyId: string }[] = [];
  const incomeNames = ['Sales', 'Services', 'Other Income'];
  const expenseNames = ['Rent', 'Salaries', 'Supplies'];
  for (const company of companies) {
    for (const name of incomeNames) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: 'INCOME',
          budgetLimit: parseFloat(faker.finance.amount({min:10000, max:30000, dec:2})),
          budgetUsed: 0,
          company: { connect: { id: company.id } },
        },
      });
      categories.push({ id: cat.id, type: 'INCOME', companyId: company.id });
    }
    for (const name of expenseNames) {
      const cat = await prisma.category.create({
        data: {
          name,
          type: 'EXPENSE',
          budgetLimit: parseFloat(faker.finance.amount({min:5000, max:20000, dec:2})),
          budgetUsed: 0,
          company: { connect: { id: company.id } },
        },
      });
      categories.push({ id: cat.id, type: 'EXPENSE', companyId: company.id });
    }
  }
  console.log(`Created ${categories.length} categories.`);

  // 4. Create Transactions (e.g., ~30 total across companies)
  const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;
  const types = ['ORDER', 'PAYMENT', 'REFUND'] as const;
  const totalTx = 30;
  for (let i = 0; i < totalTx; i++) {
    // pick a random user
    const u = faker.helpers.arrayElement(users);
    const userId = u.id;
    const compId = u.companyId;
    // pick a category of same company
    const catOptions = categories.filter(c => c.companyId === compId);
    const cat = faker.helpers.arrayElement(catOptions);
    // amount: small amounts for testing
    const amt = parseFloat(faker.finance.amount({min:10, max:1000, dec:2}));
    // date within past 90 days
    const date = faker.date.between({from: faker.date.recent({days:90}), to: new Date()});
    const type = faker.helpers.arrayElement(types);
    const status = faker.helpers.arrayElement(statuses);
    const description = faker.lorem.sentence();

    await prisma.transaction.create({
      data: {
        amount: amt,
        date,
        description,
        type,
        status,
        user: { connect: { id: userId } },
        company: { connect: { id: compId } },
        category: { connect: { id: cat.id } },
      },
    });
  }
  console.log(`Created ${totalTx} transactions.`);

  // 5. Update budgetUsed for each category based on sum of transactions
  for (const cat of categories) {
    const agg = await prisma.transaction.aggregate({
      where: { categoryId: cat.id },
      _sum: { amount: true },
    });
    const used = agg._sum.amount ?? 0;
    // Update with positive number (abs if needed)
    await prisma.category.update({
      where: { id: cat.id },
      data: { budgetUsed: Math.abs(used) },
    });
  }
  console.log('Updated budgetUsed for categories.');

  console.log('Seeding (lean) finished.');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
