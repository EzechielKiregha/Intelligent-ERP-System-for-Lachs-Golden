// app/api/crm/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.currentCompanyId
  const contacts = await prisma.contact.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.currentCompanyId || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { fullName, email, phone, jobTitle, notes } = await req.json()

    const contact = await prisma.contact.create({
      data: {
        fullName,
        email,
        phone,
        jobTitle,
        notes,
        companyId: session.user.currentCompanyId,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Contact',
        entityId: contact.id,
        userId: session.user.id,
        companyId: session.user.currentCompanyId,
        url: req.url,
        description: `Created new contact "${contact.fullName}" (${contact.email})`,
      },
    })

    return NextResponse.json(contact)
  } catch (err) {
    console.error('Contact creation error:', err)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
