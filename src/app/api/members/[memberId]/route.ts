// app/api/members/[memberId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {

  const memberId = (await params).memberId
  const session = await getServerSession();
  if (!session?.user?.companyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ success: false, message: 'Missing workspaceId', data: null }, { status: 400 });
  }

  const currentMember = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!currentMember) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!member || member.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Member not found', data: null }, { status: 404 });
  }

  const populatedMember = {
    ...member,
    name: member.user.name || member.user.email.split('@')[0],
    email: member.user.email,
  };

  return NextResponse.json({ success: true, message: 'Success', data: populatedMember });
}

// app/api/members/[memberId]/route.ts
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {

  const memberId = (await params).memberId
  const session = await getServerSession();
  if (!session?.user?.companyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ success: false, message: 'Missing workspaceId', data: null }, { status: 400 });
  }

  const memberToRemove = await prisma.member.findUnique({
    where: { id: memberId },
  });
  if (!memberToRemove || memberToRemove.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Member not found', data: null }, { status: 404 });
  }

  const currentMember = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!currentMember) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const isAdmin = currentMember.role === 'ADMIN';
  const isSelf = currentMember.id === memberId;

  if (!isAdmin && !isSelf) {
    return NextResponse.json({ success: false, message: 'Only admins can remove other members', data: null }, { status: 403 });
  }

  if (isAdmin && isSelf) {
    return NextResponse.json({ success: false, message: 'Admins cannot delete themselves', data: null }, { status: 400 });
  }

  await prisma.member.delete({ where: { id: memberId } });

  return NextResponse.json({
    success: true,
    message: isSelf ? 'Successfully left the workspace' : 'Successfully removed the member',
    data: { workspaceId },
  });
}

// app/api/members/[memberId]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {

  const memberId = (await params).memberId
  const session = await getServerSession();
  if (!session?.user?.companyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ success: false, message: 'Missing workspaceId', data: null }, { status: 400 });
  }

  const body = await req.json();
  const { role } = body;
  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return NextResponse.json({ success: false, message: 'Invalid role', data: null }, { status: 400 });
  }

  const currentMember = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!currentMember || currentMember.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const memberToUpdate = await prisma.member.findUnique({
    where: { id: memberId },
  });
  if (!memberToUpdate || memberToUpdate.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Member not found', data: null }, { status: 404 });
  }

  if (memberToUpdate.userId === session.user.id && memberToUpdate.role === 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Admin member cannot change their role', data: null }, { status: 400 });
  }

  const updatedMember = await prisma.member.update({
    where: { id: memberId },
    data: { role },
  });

  return NextResponse.json({ success: true, message: 'Successfully changed the member role', data: updatedMember });
}