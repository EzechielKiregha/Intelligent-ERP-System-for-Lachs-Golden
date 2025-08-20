// app/api/settings/pending-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // Get all users for the company
    const users = await prisma.user.findMany({
      where: { 
        companyId,
        role: { 
          in: [
            Role.SUPER_ADMIN,
            Role.ADMIN,
            Role.CEO,
            Role.MANAGER,
            Role.HR,
            Role.ACCOUNTANT,
            Role.EMPLOYEE,
            Role.USER,
            Role.MEMBER
          ] 
        }
      },
      include: {
        employee: {
          include: {
            department: true
          }
        },
        members: {
          include: {
            workspace: true
          }
        }
      }
    });

    // Format the response to include workspace names
    const formattedUsers = users.map(user => {
      const workspace = user.members[0]?.workspace;
      
      return {
        ...user,
        workspaceName: workspace?.name,
        departmentName: user.employee?.department?.name
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}




// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import prisma from '@/lib/prisma';
// import { Role, UserStatus } from '@/generated/prisma';
// import { z } from 'zod';


// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || !session.user.currentCompanyId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(session.user.role as "ADMIN" | "SUPER_ADMIN")) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const pendingUsers = await prisma.user.findMany({
//       where: {
//         companyId: session.user.currentCompanyId,
//         status: UserStatus.PENDING,
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         status: true,
//       },
//     });

//     return NextResponse.json(pendingUsers);
//   } catch (err) {
//     console.error('Error fetching pending users:', err);
//     return NextResponse.json({ error: 'Failed to load pending users' }, { status: 500 });
//   }
// }

// const manageUserSchema = z.object({
//   userId: z.string().min(1, 'User ID is required'),
//   status: z.enum([UserStatus.ACCEPTED, UserStatus.BLOCKED]),
// });

// export async function PATCH(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || !session.user.currentCompanyId || ![Role.ADMIN, Role.SUPER_ADMIN].includes(session.user.role as "ADMIN" | "SUPER_ADMIN")) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const { userId, status } = manageUserSchema.parse(body);

//     const user = await prisma.user.findUnique({
//       where: { id: userId, companyId: session.user.currentCompanyId },
//     });
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     await prisma.user.update({
//       where: { id: userId },
//       data: { status },
//     });

//     await prisma.auditLog.create({
//       data: {
//         action: 'UPDATE',
//         entity: 'User',
//         entityId: userId,
//         userId: session.user.id,
//         companyId: session.user.currentCompanyId,
//         description: `Updated user status to ${status}`,
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error('Error updating user status:', err);
//     return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
//   }
// }