import { Roles } from '@/types/globals';
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function ensureDefaultRole() {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (!user.publicMetadata.role) {
      await client.users.updateUser(userId, {
        publicMetadata: { role: "student" },
      });
    }
  } catch (error) {
    console.error('Error ensuring default role:', error);
    throw error; // Or handle as needed
  }
}

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata.role === role;
};