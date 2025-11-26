import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/get-authenticated-user';
import { generateEmbedding } from '@/lib/embeddings';
import { getKnowledgeContext } from '@/lib/qdrant';

const DENO_BACKEND_URL = process.env.DENO_BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: agentId } = await params;
    const isStream = req.nextUrl.searchParams.get('stream') === '1';
    const { message } = await req.json();

    // Check for API key authentication (for SDK usage)
    const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    let agentRecord;
    
    if (apiKeyHeader) {
      // SDK authentication via API key
      agentRecord = await prisma.agent.findFirst({
        where: {
          id: agentId,
          apiKey: apiKeyHeader,
        },
      });

      if (!agentRecord) {
        return NextResponse.json({ error: 'Agent not found or invalid API key' }, { status: 404 });
      }
    } else {
      // Dashboard authentication via session
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      agentRecord = await prisma.agent.findUnique({
        where: {
          id: agentId,
          userId: user.id,
        },
      });

      if (!agentRecord) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
    }

    if (!agentRecord.providerApiKey) {
      return NextResponse.json({ error: 'Provider API key not configured for this agent' }, { status: 400 });
    }

    // Get relevant knowledge from vector database
    let knowledgeContext = '';
    try {
      console.log(`🔍 Searching knowledge base for agent ${agentId}...`);
      const messageEmbedding = await generateEmbedding(message);
      console.log(`✅ Generated embedding (${messageEmbedding.length} dimensions)`);
      
      knowledgeContext = await getKnowledgeContext(agentId, message, messageEmbedding);
      
      if (knowledgeContext) {
        console.log(`📚 Found ${knowledgeContext.split('[Source').length - 1} relevant knowledge sources`);
      } else {
        console.log(`ℹ️ No relevant knowledge found for this query`);
      }
    } catch (embeddingError) {
      console.warn('⚠️ Could not retrieve knowledge context:', embeddingError);
    }

    // Base system instruction enriched with chatbot identity
    const baseSystemInstruction = [
      `You are the chatbot "${agentRecord.name}".`,
      agentRecord.description ? `Description: ${agentRecord.description}` : null,
      agentRecord.systemInstruction,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Enhance system instruction with knowledge context
    const enhancedSystemInstruction = knowledgeContext 
      ? `${baseSystemInstruction}\n\n${knowledgeContext}`
      : baseSystemInstruction;
    
    console.log(
      `📝 System instruction ${knowledgeContext ? 'enhanced with knowledge' : 'using base instruction only'} for chatbot "${agentRecord.name}"`
    );

    // Forward request to Deno backend
    console.log(`🔄 Forwarding chat request to Deno backend for agent ${agentId}`);
    
    const denoResponse = await fetch(`${DENO_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        message,
        provider: agentRecord.provider,
        model: agentRecord.model,
        apiKey: agentRecord.providerApiKey,
        systemInstruction: enhancedSystemInstruction,
        chatbotName: agentRecord.name,
        chatbotDescription: agentRecord.description,
      }),
    });

    if (!denoResponse.ok) {
      const errorText = await denoResponse.text();
      throw new Error(errorText || 'Deno backend error');
    }

    console.log(`✅ Received response from Deno backend for agent ${agentId}`);

    // Parse the JSON response from Deno backend
    const denoData = await denoResponse.json();
    const responseText = denoData.response || denoData.text || '';

    // If client requested streaming, send the text as a stream
    if (isStream) {
      // Create a readable stream that sends the text
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        }
      });
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Non-streaming JSON response (used by SDK / other clients)
    return NextResponse.json({
      text: responseText,
      sources: [],
    });

  } catch (error: any) {
    console.error('Error chatting with agent:', error);
    
    // Check if Deno backend is unreachable
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        error: 'Deno backend is not running. Please start it with: cd deno-backend && deno task dev' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
