import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Types
interface SuccessStory {
  id: number;
  name: string;
  post: string;
  batch: number;
  image_url: string | null;
  followed_roadmap: string; // Title of the roadmap
  connect_link: string;
  created_at: string;
}

interface CreateSuccessStoryRequest {
  name: string;
  post: string;
  batch: number;
  followed_roadmap_id: number;
  connect_link: string;
  image_url: string | null;
}

interface DeleteSuccessStoryRequest {
  id: number;
}

// Utility functions
const createErrorResponse = (message: string, status: number) =>
  new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

// GET: Fetch all success stories
export async function GET() {
  try {
    const stories = await sql<SuccessStory & { followed_roadmap_id: number }>(
      `
      SELECT ss.id, ss.name, ss.post, ss.image_url, ss.batch, ss.followed_roadmap_id, r.title AS followed_roadmap, ss.connect_link, ss.created_at
      FROM success_stories ss
      JOIN roadmaps r ON ss.followed_roadmap_id = r.id
      ORDER BY ss.created_at DESC
      `,
      []
    );

    const formattedStories: SuccessStory[] = stories.map((story) => ({
      ...story,
      created_at: formatDate(story.created_at),
    }));

    return NextResponse.json(formattedStories);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    return createErrorResponse("Failed to fetch success stories", 500);
  }
}

// POST: Create a new success story
export async function POST(request: Request) {
  try {
    const body: CreateSuccessStoryRequest = await request.json();
    const { name, post, batch, followed_roadmap_id, connect_link, image_url } = body;

    // Validation
    if (!name || !post || !batch || !followed_roadmap_id || !connect_link) {
      return createErrorResponse("Missing required fields: name, post, batch, followed_roadmap_id, connect_link", 400);
    }

    if (batch < 1900 || batch > new Date().getFullYear()) {
      return createErrorResponse("Invalid batch year", 400);
    }

    if (!connect_link.startsWith("mailto:")) {
      return createErrorResponse("Connect link must be a valid mailto: link", 400);
    }

    // Verify roadmap exists
    const roadmap = await sql<{ id: number; title: string }>(
      "SELECT id, title FROM roadmaps WHERE id = ?",
      [followed_roadmap_id]
    );
    if (roadmap.length === 0) {
      return createErrorResponse("Invalid roadmap ID", 400);
    }
    // Insert success story
    const insertResult = await sql<{ insertId: number }>(
      `INSERT INTO success_stories (name, post, batch, followed_roadmap_id, connect_link, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, post, batch, followed_roadmap_id, connect_link, image_url || null]
    );

    // Get the inserted ID from the result
    const insertedId = insertResult[0].insertId;

    if (!insertedId) {
      throw new Error("Failed to retrieve inserted ID");
    }

    // Fetch the newly inserted story
    const storyResult = await sql<SuccessStory & { followed_roadmap_id: number }>(
      `
      SELECT ss.id, ss.name, ss.post, ss.image_url, ss.batch, ss.followed_roadmap_id, r.title AS followed_roadmap, ss.connect_link, ss.created_at
      FROM success_stories ss
      JOIN roadmaps r ON ss.followed_roadmap_id = r.id
      WHERE ss.id = ?
      `,
      [insertedId]
    );

    const story = storyResult[0];

    return NextResponse.json({
      ...story,
      created_at: formatDate(story.created_at),
    });
  } catch (error) {
    console.error("Error creating success story:", error);
    return createErrorResponse("Failed to create success story", 500);
  }
}

// DELETE: Delete a success story by ID
export async function DELETE(request: Request) {
  try {
    const body: DeleteSuccessStoryRequest = await request.json();
    const { id } = body;

    if (!id) {
      return createErrorResponse("Missing required field: id", 400);
    }

    const story = await sql<{ id: number }>("SELECT id FROM success_stories WHERE id = ?", [id]);
    if (story.length === 0) {
      return createErrorResponse("Success story not found", 404);
    }

    await sql("DELETE FROM success_stories WHERE id = ?", [id]);

    return NextResponse.json({ message: "Success story deleted successfully" });
  } catch (error) {
    console.error("Error deleting success story:", error);
    return createErrorResponse("Failed to delete success story", 500);
  }
}