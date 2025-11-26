import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";
import { upsertPoints, deletePoint } from "@/lib/qdrant";
import { getAuthenticatedUser } from "@/lib/get-authenticated-user";
import { extractTextFromUrl } from "@/lib/webCrawler";

interface KnowledgeRouteParams {
  params: Promise<{ id: string }>;
}

// Removed authenticateRequest since getAuthenticatedUser handles it
// async function authenticateRequest(req: NextRequest): Promise<string | null> { ... }

export async function POST(req: NextRequest, { params }: KnowledgeRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    const { type, content } = await req.json();

    // Verify agent ownership
    const agent = await prisma.agent.findUnique({
      where: { id: id, userId: userId },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    let processedContent = content;
    if (type === "url") {
      try {
        console.log(`🌐 Starting deep crawl of: ${content}`);
        
        // Deep crawl with configurable options
        processedContent = await extractTextFromUrl(content, {
          maxDepth: 2,      // Crawl 2 levels deep
          maxPages: 10,     // Max 10 pages per URL
          sameDomain: true, // Only crawl same domain
          timeout: 10000,   // 10s timeout per page
        });
        
        console.log(`✅ Successfully crawled and extracted content (${processedContent.length} chars)`);
      } catch (urlError: any) {
        console.error("Error fetching or processing URL:", urlError);
        return NextResponse.json(
          { 
            message: "Error processing URL", 
            error: urlError.message || "Failed to crawl URL",
            details: "Make sure the URL is accessible and returns HTML content"
          },
          { status: 400 }
        );
      }
    }

    const embedding = await generateEmbedding(processedContent);

    const newKnowledgeSource = await prisma.knowledgeSource.create({
      data: {
        agentId: id,
        type,
        content: processedContent,
        embedding: Buffer.from(new Float32Array(embedding).buffer),
      },
    });

    // Upsert into Qdrant
    await upsertPoints([
      {
        id: newKnowledgeSource.id,
        vector: embedding,
        payload: {
          agentId: newKnowledgeSource.agentId,
          type: newKnowledgeSource.type,
          content: newKnowledgeSource.content,
          metadata: {},
        },
      },
    ]);

    return NextResponse.json(newKnowledgeSource, { status: 201 });
  } catch (error) {
    console.error(`Error adding knowledge source to agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error adding knowledge source to agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: KnowledgeRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  try {
    // Verify agent ownership
    const agent = await prisma.agent.findUnique({
      where: { id: id, userId: userId },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    const knowledgeSources = await prisma.knowledgeSource.findMany({
      where: { agentId: id },
      orderBy: { lastUpdated: 'desc' },
    });

    return NextResponse.json(knowledgeSources, { status: 200 });
  } catch (error) {
    console.error(`Error fetching knowledge sources for agent ${id}:`, error);
    return NextResponse.json(
      { message: `Error fetching knowledge sources for agent ${id}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: KnowledgeRouteParams) {
  const user = await getAuthenticatedUser(req);
  const { id: agentId } = await params;

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { knowledgeId } = await req.json();

    if (!knowledgeId) {
      return NextResponse.json({ message: "Knowledge ID required" }, { status: 400 });
    }

    // Verify agent ownership and knowledge source exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId, userId: user.id },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    const knowledgeSource = await prisma.knowledgeSource.findUnique({
      where: { id: knowledgeId, agentId: agentId },
    });

    if (!knowledgeSource) {
      return NextResponse.json({ message: "Knowledge source not found" }, { status: 404 });
    }

    // Delete from Qdrant first
    try {
      await deletePoint(knowledgeId);
    } catch (qdrantError) {
      console.warn('Could not delete from Qdrant (might not exist):', qdrantError);
    }

    // Delete from database
    await prisma.knowledgeSource.delete({
      where: { id: knowledgeId },
    });

    console.log(`✅ Deleted knowledge source ${knowledgeId} from agent ${agentId}`);

    return NextResponse.json({ 
      message: "Knowledge source deleted successfully",
      id: knowledgeId 
    }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting knowledge source:`, error);
    return NextResponse.json(
      { message: "Error deleting knowledge source", error: (error as Error).message },
      { status: 500 }
    );
  }
}
