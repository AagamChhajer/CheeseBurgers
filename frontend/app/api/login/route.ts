import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Set a session cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: user.id.toString(),
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Login failed' },
            { status: 500 }
        );
    }
}
