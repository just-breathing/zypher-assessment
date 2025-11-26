import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"; // Removed
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Removed
import prisma from "@/lib/prisma";
// import { verifyToken } from "@/lib/auth"; // Removed
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";

interface AgentRouteParams {
  params: Promise<{ id: string }>;
}

// Removed authenticateRequest since getAuthenticatedUser handles it
// async function authenticateRequest(req: NextRequest): Promise<string | null> { ... }

export async function GET(req: NextRequest, { params }: AgentRouteParams) {
  const { id } = await params;
  
  // Check for API key authentication (for SDK usage)
  const apiKeyHeader = req.headers.get('x-api-key');
  
  let agent;
  
  if (apiKeyHeader) {
    // SDK authentication via API key
    try {
      agent = await prisma.agent.findFirst({
        where: { 
          id: id,
          apiKey: apiKeyHeader // Use apiKey field for SDK authentication
        },
        include: { knowledgeSources: true },
      });

      if (!agent) {
        return NextResponse.json({ message: "Agent not found or invalid API key" }, { status: 404 });
      }
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      return NextResponse.json(
        { message: `Error fetching agent ${id}`, error: (error as Error).message },
        { status: 500 }
      );
    }
  } else {
    // Dashboard authentication via session
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    try {
      agent = await prisma.agent.findUnique({
        where: { id: id, userId: user.id },
        include: { knowledgeSources: true },
      });

      if (!agent) {
        return NextResponse.json({ message: "Agent not found" }, { status: 404 });
      }
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      return NextResponse.json(
        { message: `Error fetching agent ${id}`, error: (error as Error).message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(agent, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: AgentRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    const { name, description, model, systemInstruction, theme, provider, providerApiKey } = await req.json();

    const updatedAgent = await prisma.agent.update({
      where: { id: id, userId: userId },
      data: {
        name,
        description,
        model,
        provider,
        providerApiKey,
        systemInstruction,
        theme,
      },
    });

    return NextResponse.json(updatedAgent, { status: 200 });
  } catch (error) {
    console.error(`Error updating agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error updating agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: AgentRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    await prisma.agent.delete({
      where: { id: id, userId: userId },
    });

    return NextResponse.json({ message: "Agent deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error deleting agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}
