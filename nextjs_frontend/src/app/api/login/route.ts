import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle login request
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const loginEntry = await prisma.login.findFirst({ where: { email } });
    if (!loginEntry || loginEntry.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: loginEntry.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Login successful', user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle user registration
export async function PUT(req: NextRequest) {
  try {
    const { email, password, userId } = await req.json();
    if (!email || !password || !userId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const loginEntry = await prisma.login.create({
      data: { email, password, userId },
    });

    return NextResponse.json({ message: 'User registered successfully', login: loginEntry });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle deleting a login entry
export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const loginEntry = await prisma.login.findFirst({ where: { email } });
    if (!loginEntry) {
      return NextResponse.json({ error: 'Login entry not found' }, { status: 404 });
    }

    await prisma.login.delete({ where: { id: loginEntry.id } });
    return NextResponse.json({ message: 'Login entry deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
