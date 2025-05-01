import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { checkRole } from '@/lib/roles';

const PROTECT = true;

interface Roadmap {
  id: number;
  title: string;
  year: number;
  ai_generated: boolean;
  created_by: string;
  steps: { title: string; bullets: string[]; link?: string }[];
  created_at: string;
  likes: number;
  progress?: { liked: boolean; completed_steps: number[] };
}

interface RoadmapProgress {
  user_id: string;
  roadmap_id: number;
  liked: boolean;
  completed_steps: number[];
}

const RoadmapStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet is required'),
  link: z.string().url().optional(),
}).strict();

const CreateRoadmapSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.number().int().min(1).max(4) || 1,
  ai_generated: z.boolean().default(false),
  steps: z.array(RoadmapStepSchema).min(1, 'At least one step is required'),
}).strict();

const UpdateProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roadmapId: z.number().int().positive('Roadmap ID must be a positive integer'),
  liked: z.boolean().optional(),
  completed_steps: z.array(z.number().int().nonnegative()).optional(),
}).strict();

const createErrorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

const getAuthData = async () => {
  if (!PROTECT) {
    return { userId: 'test-user', isAdmin: true };
  }
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  return { userId, isAdmin: userId !== null && role === 'admin' };
};

const parseSteps = (steps: unknown): { title: string; bullets: string[]; link?: string }[] => {
  if (Array.isArray(steps)) {
    const result = z.array(RoadmapStepSchema).safeParse(steps);
    if (!result.success) {
      console.warn('Invalid steps array format:', result.error);
      return [];
    }
    return result.data;
  }

  if (typeof steps === 'string') {
    try {
      const parsed = JSON.parse(steps);
      const result = z.array(RoadmapStepSchema).safeParse(parsed);
      if (!result.success) {
        console.warn('Invalid steps JSON format:', result.error);
        return [];
      }
      return result.data;
    } catch (error) {
      console.warn('Failed to parse steps JSON:', error);
      return [];
    }
  }

  console.warn('Steps is not a string or array:', steps);
  return [];
};

const parseCompletedSteps = (completedSteps: unknown): number[] => {
  if (Array.isArray(completedSteps)) {
    const result = z.array(z.number().int().nonnegative()).safeParse(completedSteps);
    if (!result.success) {
      console.warn('Invalid completed_steps array format:', result.error);
      return [];
    }
    return result.data;
  }

  if (typeof completedSteps === 'string') {
    try {
      const parsed = JSON.parse(completedSteps);
      const result = z.array(z.number().int().nonnegative()).safeParse(parsed);
      if (!result.success) {
        console.warn('Invalid completed_steps JSON format:', result.error);
        return [];
      }
      return result.data;
    } catch (error) {
      console.warn('Failed to parse completed_steps JSON:', error);
      return [];
    }
  }

  console.warn('Completed_steps is not a string or array:', completedSteps);
  return [];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (roadmapId) {
      const id = parseInt(roadmapId, 10);
      if (isNaN(id)) {
        return createErrorResponse('Invalid roadmap ID', 400);
      }

      const result = await sql<Roadmap>(
        'SELECT id, title, year, ai_generated, created_by, steps, created_at, likes FROM roadmaps WHERE id = ?',
        [id]
      );

      if (result.length === 0) {
        return createErrorResponse('Roadmap not found', 404);
      }

      const roadmap = {
        ...result[0],
        steps: parseSteps(result[0].steps),
      };

      if (userId) {
        const progress = await sql<RoadmapProgress>(
          'SELECT user_id, roadmap_id, liked, completed_steps FROM roadmap_progress WHERE user_id = ? AND roadmap_id = ?',
          [userId, id]
        );

        if (progress.length > 0) {
          roadmap.progress = {
            liked: progress[0].liked,
            completed_steps: parseCompletedSteps(progress[0].completed_steps),
          };
        }
      }

      return NextResponse.json({ data: roadmap }, { status: 200 });
    }

    const roadmaps = await sql<Roadmap>(
      'SELECT id, title, year, ai_generated, created_by, steps, created_at, likes FROM roadmaps ORDER BY created_at DESC',
      []
    );

    let formattedRoadmaps = roadmaps.map(roadmap => ({
      ...roadmap,
      steps: parseSteps(roadmap.steps),
    }));

    if (userId) {
      const progress = await sql<RoadmapProgress>(
        'SELECT user_id, roadmap_id, liked, completed_steps FROM roadmap_progress WHERE user_id = ?',
        [userId]
      );

      const progressMap = new Map(progress.map(p => [p.roadmap_id, {
        liked: p.liked,
        completed_steps: parseCompletedSteps(p.completed_steps),
      }]));

      formattedRoadmaps = formattedRoadmaps.map(roadmap => ({
        ...roadmap,
        progress: progressMap.get(roadmap.id),
      }));
    }

    return NextResponse.json({ data: formattedRoadmaps }, { status: 200 });
  } catch (error) {
    console.error('Error fetching roadmaps:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return createErrorResponse('Failed to fetch roadmaps', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await getAuthData();
    if (PROTECT && !userId) {
      return createErrorResponse('Unauthorized: Authentication required', 401);
    }
    if (PROTECT && !(await checkRole('alumni'))) {
      return createErrorResponse('Forbidden: Only alumni can create roadmaps', 403);
    }

    const body = await request.json();
    const parsed = CreateRoadmapSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { title, year, ai_generated, steps } = parsed.data;

    await sql(
      'INSERT INTO roadmaps (title, year, ai_generated, created_by, steps, likes) VALUES (?, ?, ?, ?, ?, 0)',
      [title, year ?? null, ai_generated, userId || 'test-user', JSON.stringify(steps)]
    );

    const result = await sql<Roadmap>(
      'SELECT id, title, year, ai_generated, created_by, steps, created_at, likes FROM roadmaps WHERE id = LAST_INSERT_ID()',
      []
    );

    const roadmap = {
      ...result[0],
      steps: parseSteps(result[0].steps),
    };

    return NextResponse.json(
      { data: roadmap, message: 'Roadmap created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating roadmap:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return createErrorResponse('Failed to create roadmap', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await getAuthData();
    if (PROTECT && !userId) {
      return createErrorResponse('Unauthorized: Authentication required', 401);
    }
    if (PROTECT && !(await checkRole('student'))) {
      return createErrorResponse('Forbidden: Only students can update roadmap progress', 403);
    }

    const body = await request.json();
    const parsed = UpdateProgressSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { userId: requestUserId, roadmapId, liked, completed_steps } = parsed.data;

    if (PROTECT && requestUserId !== userId) {
      return createErrorResponse('Forbidden: Cannot update progress for another user', 403);
    }

    if (liked === undefined && completed_steps === undefined) {
      return createErrorResponse(
        'At least one of liked or completed_steps must be provided',
        400
      );
    }

    const roadmap = await sql<{ id: number }>(
      'SELECT id FROM roadmaps WHERE id = ?',
      [roadmapId]
    );
    if (roadmap.length === 0) {
      return createErrorResponse('Roadmap not found', 404);
    }

    const existingProgress = await sql<RoadmapProgress>(
      'SELECT liked FROM roadmap_progress WHERE user_id = ? AND roadmap_id = ?',
      [requestUserId, roadmapId]
    );

    let likesAdjustment = 0;
    if (liked !== undefined) {
      if (existingProgress.length === 0) {
        likesAdjustment = liked ? 1 : 0;
      } else {
        if (existingProgress[0].liked && !liked) {
          likesAdjustment = -1;
        } else if (!existingProgress[0].liked && liked) {
          likesAdjustment = 1;
        }
      }
    }

    if (likesAdjustment !== 0) {
      await sql(
        'UPDATE roadmaps SET likes = likes + ? WHERE id = ?',
        [likesAdjustment, roadmapId]
      );
    }

    await sql(
      `
      INSERT INTO roadmap_progress (user_id, roadmap_id, liked, completed_steps)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        liked = COALESCE(?, liked),
        completed_steps = COALESCE(?, completed_steps)
      `,
      [
        requestUserId,
        roadmapId,
        liked ?? false,
        JSON.stringify(completed_steps ?? []),
        liked ?? null,
        completed_steps ? JSON.stringify(completed_steps) : null,
      ]
    );

    const result = await sql<RoadmapProgress>(
      'SELECT user_id, roadmap_id, liked, completed_steps FROM roadmap_progress WHERE user_id = ? AND roadmap_id = ?',
      [requestUserId, roadmapId]
    );

    let responseData: RoadmapProgress;
    if (result[0]) {
      responseData = {
        ...result[0],
        completed_steps: parseCompletedSteps(result[0].completed_steps),
      };
    } else {
      responseData = {
        user_id: requestUserId,
        roadmap_id: roadmapId,
        liked: liked ?? false,
        completed_steps: completed_steps ?? [],
      };
    }

    return NextResponse.json(
      {
        data: responseData,
        message: 'Roadmap progress updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating roadmap progress:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return createErrorResponse('Failed to update roadmap progress', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, isAdmin } = await getAuthData();
    if (PROTECT && !userId) {
      return createErrorResponse('Unauthorized: Authentication required', 401);
    }
    if (PROTECT && !isAdmin && !(await checkRole('alumni'))) {
      return createErrorResponse('Forbidden: Only alumni or admins can delete roadmaps', 403);
    }

    const { searchParams } = new URL(request.url);
    const roadmapId = parseInt(searchParams.get('id') || '', 10);
    if (isNaN(roadmapId)) {
      return createErrorResponse('Invalid roadmap ID', 400);
    }

    const roadmap = await sql<{ created_by: string }>(
      'SELECT created_by FROM roadmaps WHERE id = ?',
      [roadmapId]
    );
    if (roadmap.length === 0) {
      return createErrorResponse('Roadmap not found', 404);
    }

    if (PROTECT && !isAdmin && roadmap[0].created_by !== userId) {
      return createErrorResponse(
        'Unauthorized: Only the creator or admin can delete this roadmap',
        403
      );
    }

    await sql('DELETE FROM roadmaps WHERE id = ?', [roadmapId]);
    return NextResponse.json(
      { message: 'Roadmap deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting roadmap:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return createErrorResponse('Failed to delete roadmap', 500);
  }
}