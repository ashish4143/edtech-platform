import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'userId, currentPassword and newPassword are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
