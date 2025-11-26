import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // Removed
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Removed
import prisma from "@/lib/prisma";
import { customAlphabet } from "nanoid";
// import { verifyToken } from "@/lib/auth"; // Removed
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";

interface ApiKeyRouteParams {
  params: Promise<{ id: string }>;
}

// Helper to generate a new API key
const generateApiKey = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  32
);

// Removed authenticateRequest since getAuthenticatedUser handles it
// async function authenticateRequest(req: NextRequest): Promise<string | null> { ... }

export async function GET(req: NextRequest, { params }: ApiKeyRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: id, userId: userId },
      select: { apiKey: true }, // Only return the API key
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ apiKey: agent.apiKey }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching API key for agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error fetching API key for agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: ApiKeyRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    const newApiKey = generateApiKey();

    const updatedAgent = await prisma.agent.update({
      where: { id: id, userId: userId },
      data: { apiKey: newApiKey },
      select: { apiKey: true }, // Only return the new API key
    });

    return NextResponse.json({ apiKey: updatedAgent.apiKey }, { status: 200 });
  } catch (error) {
    console.error(`Error regenerating API key for agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error regenerating API key for agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}
