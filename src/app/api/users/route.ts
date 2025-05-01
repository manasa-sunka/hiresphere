import { NextResponse } from 'next/server';
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

interface ClerkEmail {
  id: string;
  emailAddress: string;
}

interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  emailAddresses: ClerkEmail[];
  publicMetadata: { role?: UserRole };
  createdAt: number;
}

interface ClerkError {
  message: string;
  status?: number;
  errors?: { message: string }[];
  clerkTraceId?: string;
}

// Initialize Clerk
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Utility functions
const mapClerkUserToResponse = (user: ClerkUser): UserResponse => {
  const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
  return {
    id: user.id,
    email: primaryEmail?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || null,
    role: user.publicMetadata.role || 'student',
    createdAt: user.createdAt,
  };
};

const createErrorResponse = (message: string, status: number) =>
  new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// GET: Fetch all users
export async function GET() {
  try {
    const userList = await clerkClient.users.getUserList({ limit: USERS_PER_PAGE });
    const mappedUsers = userList.data.map((user) => mapClerkUserToResponse(user as ClerkUser));
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

    return NextResponse.json(mapClerkUserToResponse(user as ClerkUser));
  } catch (error) {
    const clerkError = error as ClerkError;
    console.error('Error creating user:', {
      message: clerkError.message,
      status: clerkError.status,
      errors: clerkError.errors,
      clerkTraceId: clerkError.clerkTraceId,
    });

    // Handle specific Clerk errors
    if (clerkError.status === 422 && clerkError.errors) {
      const errorMessage = clerkError.errors
        .map((err) => err.message)
        .join(', ');
      return createErrorResponse(`Failed to create user: ${errorMessage}`, 422);
    }

    return createErrorResponse('Failed to create user', 500);
  }
}