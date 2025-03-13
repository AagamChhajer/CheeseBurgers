import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, userId } = await req.json();

    if (!name || !email || !password || !userId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if email already exists in the User model (since Signup does not have a unique email constraint)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: name,
        email,
        password,
        studentId: null, // Default null, change if required
        course: null, // Default null, change if required
      },
    });

    // Create a new signup entry
    const signupEntry = await prisma.signup.create({
      data: {
        name,
        email,
        password,
        userId: newUser.id, // Use the newly created user's ID
      },
    });

    return NextResponse.json({ 
      message: 'Signup successful', 
      signup: signupEntry 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
