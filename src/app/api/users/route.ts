import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { sql } from '@/lib/db';

// Constants
const VALID_ROLES = ['admin', 'student', 'alumni'] as const;
const USERS_PER_PAGE = 100;

// Types
type UserRole = typeof VALID_ROLES[number];

interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

interface CreateUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
}

interface RoadmapTableData {
  title: string;
  year: number | null;
  ai_generated: 'AI' | 'User';
  created_by: string;
  created_at: string; // Formatted MM/DD/YYYY
  likes: number;
}

interface RoadmapStats {
  totalRoadmaps: number;
  aiVsUser: { name: string; value: number }[];
  byYear: { year: number; count: number }[];
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
}

interface ClerkError {
  message: string;
  status?: number;
  errors?: { message: string }[];
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
    fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || null,
    role: user.publicMetadata.role || 'student',
  };
};

const createErrorResponse = (message: string, status: number) =>
  new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

// GET: Fetch users and roadmap data for Admin Dashboard
export async function GET() {
  try {

    // Fetch users from Clerk
    const userList = await clerkClient.users.getUserList({ limit: USERS_PER_PAGE });
    const users = userList.data as ClerkUser[];
    const mappedUsers = users.map(mapClerkUserToResponse);

    // Fetch roadmaps from database
    const roadmaps = await sql<{
      id: number;
      title: string;
      year: number | null;
      ai_generated: boolean;
      created_by: string;
      created_at: string;
      likes: number;
    }>(
      'SELECT id, title, year, ai_generated, created_by, created_at, likes FROM roadmaps ORDER BY created_at DESC',
      []
    );

    // Map roadmaps for table
    const roadmapTable: RoadmapTableData[] = roadmaps.map((roadmap) => {
      const creator = users.find((user) => user.id === roadmap.created_by);
      const creatorName = creator
        ? creator.firstName && creator.lastName
          ? `${creator.firstName} ${creator.lastName}`
          : creator.firstName || creator.lastName || roadmap.created_by
        : roadmap.created_by;
      return {
        title: roadmap.title,
        year: roadmap.year,
        ai_generated: roadmap.ai_generated ? 'AI' : 'User',
        created_by: creatorName,
        created_at: formatDate(roadmap.created_at),
        likes: roadmap.likes,
      };
    });

    // Calculate minimal roadmap statistics
    const aiVsUser = [
      { name: 'AI-Generated', value: roadmaps.filter((r) => r.ai_generated).length },
      { name: 'User-Generated', value: roadmaps.filter((r) => !r.ai_generated).length },
    ];

    const byYear = roadmaps
      .filter((r) => r.year !== null)
      .reduce((acc, r) => {
        const year = r.year!;
        const existing = acc.find((item) => item.year === year);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ year, count: 1 });
        }
        return acc;
      }, [] as { year: number; count: number }[])
      .sort((a, b) => b.year - a.year);

    const roadmapStats: RoadmapStats = {
      totalRoadmaps: roadmaps.length,
      aiVsUser,
      byYear,
    };

    return NextResponse.json({
      users: mappedUsers,
      roadmapData: {
        table: roadmapTable,
        stats: roadmapStats,
      },
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return createErrorResponse('Failed to fetch admin data', 500);
  }
}

// POST: Create a new user (admin-only)
export async function POST(request: Request) {
  try {
    // Check admin access


    const body: CreateUserRequest = await request.json();
    const { firstName, lastName, email, password, role: userRole } = body;

    if (!firstName || !email || !password || !userRole) {
      return createErrorResponse('Missing required fields: firstName, email, password, role', 400);
    }

    if (!VALID_ROLES.includes(userRole)) {
      return createErrorResponse('Invalid role. Must be admin, student, or alumni', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    const user = await clerkClient.users.createUser({
      firstName,
      lastName,
      emailAddress: [email],
      password,
      publicMetadata: { role: userRole },
    });

    return NextResponse.json(mapClerkUserToResponse(user as ClerkUser));
  } catch (error) {
    const clerkError = error as ClerkError;
    console.error('Error creating user:', {
      message: clerkError.message,
      status: clerkError.status,
      errors: clerkError.errors,
    });

    if (clerkError.status === 422 && clerkError.errors) {
      const errorMessage = clerkError.errors.map((err) => err.message).join(', ');
      return createErrorResponse(`Failed to create user: ${errorMessage}`, 422);
    }

    return createErrorResponse('Failed to create user', 500);
  }
}