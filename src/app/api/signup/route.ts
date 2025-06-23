import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { SignUpInput, signUpSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('Received data:', body);
    
    if (!body) {
      console.error("Invalid JSON input received");
      return NextResponse.json({ message: 'Request body is required' }, { status: 400 });
    }

    const parseResult = signUpSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.format());
      return NextResponse.json(
        { message: "Validation error", errors: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, company, email, password } = parseResult.data as SignUpInput;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("Duplicate email detected:", email);

      // Log failure directly using Prisma
      await prisma.auditLog.create({
        data: {
          companyId: existingUser.companyId || "N/A",
          action: 'CREATE_FAILED',
          description: `Failed to create user: Email ${email} already exists`,
          url: '/api/signup',
          entity: 'User',
          entityId: null,
          userId: existingUser.id,
        },
      });

      return NextResponse.json({ message: 'Email already used' }, { status: 400 });
    }

    let companyRecord;
    try {
      // Check if the company exists
      companyRecord = await prisma.company.findFirst({ where: { name: company } });
      if (!companyRecord) {
        // Create the company if it doesn't exist
        companyRecord = await prisma.company.create({
          data: {
            name: company,
            contactEmail: `${email}`,
            timezone: 'UTC-05:00',
            dateFormat: 'YYYY-MM-DD',
          },
        });

        // Create a default department for the company
        const department = await prisma.department.create({
          data: {
            name: 'General',
            companyId: companyRecord.id,
          },
        });

        // Create an employee record for the user
        const employee = await prisma.employee.create({
          data: {
            firstName,
            lastName,
            email,
            jobTitle: 'Administrator',
            status: 'ACTIVE',
            departmentId: department.id,
            companyId: companyRecord.id,
            hireDate: new Date(),
            salary: 0,
          },
        });

        // Hash the user's password
        const hashedPassword = await hash(password, 10);

        // Create the user record
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            role: 'ADMIN', // Assign admin role since they are creating the company
            companyId: companyRecord.id,
            employeeId: employee.id,
          },
        });

        console.log("User created successfully:", user);

        // Log success directly using Prisma
        await prisma.auditLog.create({
          data: {
            companyId: user.companyId || "N/A",
            action: 'CREATE',
            description: `Created user with ID ${user.id}`,
            url: '/api/signup',
            entity: 'User',
            entityId: user.id,
            userId: user.id,
            timestamp: new Date(),
          },
        });

        return NextResponse.json(user, { status: 200 });
      }
    } catch (err) {
      console.error("Error during company, department, or employee creation:", err);
      return NextResponse.json({ message: 'Failed to create company, department, or employee' }, { status: 500 });
    }

    // If the company exists, hash the password and create the user
    let hashedPassword;
    try {
      hashedPassword = await hash(password, 10);
    } catch (err) {
      console.error("Error hashing password:", err);
      return NextResponse.json({ message: 'Failed to hash password' }, { status: 500 });
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          companyId: companyRecord.id,
          role: 'USER',
        },
      });

      if (user){
        // Log success directly using Prisma
      await prisma.auditLog.create({
        data: {
          companyId: user.companyId || "N/A",
          action: 'CREATE',
          description: `Created user with ID ${user.id}`,
          url: '/api/signup',
          entity: 'User',
          entityId: user.id,
          userId: user.id,
          timestamp: new Date(),
        },
      });
      }
        // Ensure the response is sent and no further code is executed
      return NextResponse.json(user, { status: 200 });
    } catch (err:any) {
      console.error("Error creating user record:", err);
      // Log failure directly using Prisma
      await prisma.auditLog.create({
        data: {
          companyId: "N/A",
          action: 'CREATE_FAILED',
          description: `Failed to create user: ${err.message}`,
          url: '/api/signup',
          entity: 'User',
          entityId: null,
          userId: null,
          timestamp: new Date(),
        },
      });
      return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
    }
    
  } catch (err : any) {
    console.error("Unexpected error during signup:", err);

    // Log failure directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId: "N/A",
        action: 'CREATE_FAILED',
        description: `Failed to create user: ${err.message}`,
        url: '/api/signup',
        entity: 'User',
        entityId: null,
        userId: null,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}