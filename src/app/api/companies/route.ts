import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { companySchema } from '@/lib/validations/company';
import { NextResponse } from 'next/server';
import { Role, UserStatus } from '@/generated/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {

  // no need to check for session here, because the user is creating a company and creating his/her account at the same time
  // need to request body for isNewOwner field
  const isNewOwner = req.headers.get('is-new-owner') === 'true';

  if (!isNewOwner) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = await req.json();

      // console.log("[Server Data] ", body);

      const data = companySchema.parse(body); // Server-side validation

      const company = await prisma.company.create({
        data: {
          ...data,
          users: { connect: { id: session.user.id } },
          owners : { connect: { id: session.user.id } },
          images: {
            create: {
              url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              contentType: "image/png",
              size: 10000,
            },
          },
        },
      });

      if (company) {
        // Update user's current company
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            currentCompanyId: company.id,
            role: Role.OWNER, // Set the user as ADMIN for the new company
            ownedCompanies: {
              connect: { id: company.id },
            },
          },
        });
      }

      return NextResponse.json(company, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Failed to create company' }, { status: 500 });
    }
  } else {
    try {
      const body = await req.json();

      const data = companySchema.parse(body); // Server-side validation

      const { firstName, lastName, email, password, role, status, ...companyData } = data;

      const hashedPassword = await hash(password || "erp12345", 10);

      const company = await prisma.company.create({
        data: {
          ...companyData,
          images: {
            create: {
              url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              contentType: "image/png",
              size: 10000,
            },
          },
        },
      });

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email : email || "",
          password: hashedPassword,
          role: role || Role.OWNER, // Default to OWNER if not provided
          status: status || UserStatus.ACCEPTED, // Default to ACTIVE if not provided
          currentCompanyId: company.id,
          companyId: company.id,
          ownedCompanies: {
            connect: { id: company.id },
          },
        },
      });

      // Connect the user to the company
      await prisma.company.update({
        where: { id: company.id },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
      });

      return NextResponse.json(company, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Failed to create company' }, { status: 500 });
    }
  }
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch companies' }, { status: 500 });
  }
}