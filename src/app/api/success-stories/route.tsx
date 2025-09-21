import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Types
interface SuccessStory {
  id: number;
  name: string;
  post: string;
  batch: number;
  image_url: string | null;
  followed_roadmap: string; // Roadmap title as string
  connect_link: string;
  created_at: string;
}

interface CreateSuccessStoryRequest {
  name: string;
  post: string;
  batch: number;
  followed_roadmap: string; // title
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

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

// GET: Fetch all success stories
export async function GET() {
  try {
    const stories = await sql<SuccessStory>(
      `SELECT * FROM success_stories ORDER BY created_at DESC`
    );

    const formattedStories = stories.map((story) => ({
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
    const { name, post, batch, followed_roadmap, connect_link, image_url } = body;

    // Validation
    if (!name?.trim() || !post?.trim() || !batch || !followed_roadmap?.trim() || !connect_link?.trim()) {
      return createErrorResponse("Missing or empty required fields", 400);
    }

    if (batch < 1900 || batch > new Date().getFullYear()) {
      return createErrorResponse("Invalid batch year", 400);
    }

    if (!connect_link.startsWith("mailto:")) {
      return createErrorResponse("Connect link must be a valid mailto: link", 400);
    }

    // Insert success story
    const insertResult = await sql<{ insertId: number; affectedRows: number }>(
      `INSERT INTO success_stories (name, post, batch, followed_roadmap, connect_link, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), post.trim(), batch, followed_roadmap.trim(), connect_link.trim(), image_url || null]
    );

    // Log insertResult for debugging (remove in production)
    console.log("insertResult:", insertResult);

    // Access insertId and affectedRows from the first element of the array
    const insertedId = insertResult[0]?.insertId;
    if (!insertedId || insertResult[0]?.affectedRows === 0) {
      throw new Error("Failed to insert success story or retrieve inserted ID");
    }

    // Fetch the newly inserted story
    const storyResult = await sql<SuccessStory>(
      `SELECT * FROM success_stories WHERE id = ?`,
      [insertedId]
    );

    if (storyResult.length === 0) {
      throw new Error("Inserted success story not found");
    }

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

    if (!id) return createErrorResponse("Missing required field: id", 400);

    const story = await sql<{ id: number }>("SELECT id FROM success_stories WHERE id = ?", [id]);
    if (story.length === 0) return createErrorResponse("Success story not found", 404);

    await sql("DELETE FROM success_stories WHERE id = ?", [id]);
    return NextResponse.json({ message: "Success story deleted successfully" });
  } catch (error) {
    console.error("Error deleting success story:", error);
    return createErrorResponse("Failed to delete success story", 500);
  }
}
