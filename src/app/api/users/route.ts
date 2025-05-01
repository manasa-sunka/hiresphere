import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/clerk-sdk-node';

// Constants
const VALID_ROLES = ['admin', 'student', 'alumni'] as const;
const USERS_PER_PAGE = 100;

// Types
type UserRole = typeof VALID_ROLES[number];

interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: UserRole;
  createdAt: number;
}

interface CreateUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
}

// Initialize Clerk
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Utility functions
const mapClerkUserToResponse = (user: any): UserResponse => ({
  id: user.id,
  email: user.emailAddresses.find((email: any) => email.id === user.primaryEmailAddressId)?.emailAddress || '',
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || null,
  role: (user.publicMetadata as { role?: 'admin' | 'student' | 'alumni' }).role || 'student',
  createdAt: user.createdAt,
});

const createErrorResponse = (message: string, status: number) =>
  new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });


// GET: Fetch all users
export async function GET() {
  try {
    const userList = await clerkClient.users.getUserList({ limit: USERS_PER_PAGE });
    const mappedUsers = userList.data.map(mapClerkUserToResponse);
    return NextResponse.json({ users: mappedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return createErrorResponse('Failed to fetch users', 500);
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {

    // Parse and validate request body
    const body: CreateUserRequest = await request.json();
    const { firstName, lastName, email, password, role } = body;

    if (!firstName || !email || !password || !role) {
      return createErrorResponse('Missing required fields: firstName, email, password, role', 400);
    }

    if (!VALID_ROLES.includes(role)) {
      return createErrorResponse('Invalid role. Must be admin, student, or alumni', 400);
    }

    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Create user in Clerk
    const user = await clerkClient.users.createUser({
      firstName,
      lastName,
      emailAddress: [email],
      password,
      publicMetadata: { role },
    });

    return NextResponse.json(mapClerkUserToResponse(user));
  } catch (error: any) {
    console.error('Error creating user:', {
      message: error.message,
      status: error.status,
      errors: error.errors,
      clerkTraceId: error.clerkTraceId,
    });

    // Handle specific Clerk errors
    if (error.status === 422 && error.errors) {
      const errorMessage = error.errors
        .map((err: any) => err.message)
        .join(', ');
      return createErrorResponse(`Failed to create user: ${errorMessage}`, 422);
    }

    return createErrorResponse('Failed to create user', 500);
  }
}