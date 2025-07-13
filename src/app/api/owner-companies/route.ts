// /api/owner-companies/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comps = []
    if (session.user.role.match(Role.USER)){
      
    const company = await prisma.company.findFirst({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      // select: {
      //   id: true,
      //   name: true,
      //   industry: true,
      // },
      include : { images : {
        select : { url : true },
        take : 1
      } }
    });
    comps.push(company)
    } else if (session.user.role.match(Role.ADMIN)){
      
      const company = await prisma.company.findFirst({
        where: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
        // select: {
        //   id: true,
        //   name: true,
        //   industry: true,
        // },
        include : { images : {
          select : { url : true },
          take : 1
        } }
      });
      comps.push(company)
    } else if (session.user.role.match(Role.ADMIN)){
      
      const companies = await prisma.company.findMany({
        where: {
          users: {
            some: {
              id: session.user.id,
              role: Role.OWNER, // Ensure the user is an owner
            },
          },
        },
        // select: {
        //   id: true,
        //   name: true,
        //   industry: true,
        // },
        include : { images : {
          select : { url : true },
          take : 1
        }}
      });
      companies.map((c) => {
        comps.push({...c})
      })
    }

    // console.log("[ Companies ] ",comps)
    
    return NextResponse.json({comps});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch companies' }, { status: 500 });
  }
}