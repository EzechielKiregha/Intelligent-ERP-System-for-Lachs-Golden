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
  const data = await req.json()
  const updated = await prisma.contact.updateMany({
    where: { id, companyId },
    data,
  })
  if (updated.count === 0) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; 
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId
  const deleted = await prisma.contact.deleteMany({
    where: { id, companyId },
  })
  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
