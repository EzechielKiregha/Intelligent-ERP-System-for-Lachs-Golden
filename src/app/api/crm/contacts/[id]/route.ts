// app/api/crm/contacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; 
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId
  const contact = await prisma.contact.findFirst({
    where: { id, companyId }
  })
  if (!contact) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(contact)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; 
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId
  try {
    const { fullName, email, phone, jobTitle, notes } = await req.json()

    const updated = await prisma.contact.updateMany({
      where: { id, companyId },
      data: { fullName, email, phone, jobTitle, notes },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 })
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Contact',
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        url: req.url,
        description: `Updated contact "${fullName}" (${email})`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact update error:', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; 
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId
  try {
    const contact = await prisma.contact.deleteMany({
      where: { id, companyId },
    })

    if (contact.count === 0) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 })
    }

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Contact',
        entityId: id,
        userId: session.user.id,
        companyId,
        url: req.url,
        description: `Deleted a contact with ID ${id}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact delete error:', err)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
