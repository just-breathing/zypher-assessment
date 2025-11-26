import { QdrantClient } from "@qdrant/qdrant-js";

const qdrantClient = new QdrantClient({
  host: process.env.QDRANT_HOST || "localhost",
  port: parseInt(process.env.QDRANT_PORT || "6333"),
});

export const QDRANT_COLLECTION_NAME = "zypher_knowledge_base";

// Deterministically convert a string ID (e.g. Prisma cuid)
// into a positive 32-bit integer ID that Qdrant accepts.
function stringToNumericId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    // Simple 31-based rolling hash, kept in uint32 range
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  // Ensure non-zero (Qdrant allows 0 but we avoid it just in case)
  return hash || 1;
}

export async function createCollection() {
  try {
    await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
      vectors: { size: 384, distance: "Cosine" }, // 384 for all-MiniLM-L6-v2 (Transformers.js)
    });
    console.log(`Collection '${QDRANT_COLLECTION_NAME}' created or already exists.`);
  } catch (error: any) {
    if (error.status === 409) {
      console.log(`Collection '${QDRANT_COLLECTION_NAME}' already exists.`);
    } else {
      console.error("Error creating collection:", error);
      throw error;
    }
  }
}

interface Point {
  id: string; // Application-level ID (e.g. Prisma KnowledgeSource.id)
  vector: number[];
  payload?: Record<string, any>;
}

export async function upsertPoints(points: Point[]) {
  try {
    // Ensure collection exists before upserting
    await ensureCollection();
    
    // Validate and format points for Qdrant
    const formattedPoints = points.map((point) => {
      if (!Array.isArray(point.vector)) {
        throw new Error(`Point ${point.id} has invalid vector (not an array)`);
      }
      if (point.vector.length !== 384) {
        throw new Error(`Point ${point.id} has wrong vector dimension: ${point.vector.length} (expected 384)`);
      }
      
      // Ensure vector contains valid numbers
      const vector = point.vector.map(v => {
        const num = Number(v);
        if (!isFinite(num)) {
          throw new Error(`Invalid vector value: ${v}`);
        }
        return num;
      });

      // Use a deterministic numeric ID derived from our app's ID.
      // Qdrant accepts unsigned integers, so we hash the string ID
      // to a stable 32‑bit number. The original ID is also stored
      // in payload.originalId for filtering/deletion.
      return {
        id: stringToNumericId(point.id),
        vector,
        payload: {
          ...(point.payload || {}),
          originalId: point.id, // Store original ID in payload for reference
        }
      };
    });
    
    await qdrantClient.upsert(QDRANT_COLLECTION_NAME, { points: formattedPoints });
    console.log(`✅ Successfully upserted ${formattedPoints.length} point(s) to Qdrant`);
  } catch (error: any) {
    console.error("Error upserting points:", error);
    if (error.data) {
      console.error("Qdrant error details:", JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

async function ensureCollection() {
  try {
    await qdrantClient.getCollection(QDRANT_COLLECTION_NAME);
  } catch (error: any) {
    if (error.status === 404) {
      console.log("Collection doesn't exist, creating...");
      await createCollection();
    } else {
      throw error;
    }
  }
}

export async function searchVectors(vector: number[], limit: number = 3, agentId?: string) {
  const filter = agentId ? { must: [{ key: "agentId", match: { value: agentId } }] } : undefined;
  
  const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
    vector,
    limit,
    with_payload: true,
    filter,
  });
  return searchResult.map(result => ({
    content: result.payload?.content,
    score: result.score,
    id: result.id,
    metadata: result.payload?.metadata,
  }));
}

// Delete a specific point by ID
export async function deletePoint(pointId: string) {
  try {
    // Delete by payload.originalId instead of relying on Qdrant's internal ID
    await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
      filter: {
        must: [{ key: "originalId", match: { value: pointId } }],
      },
    });
    console.log(`✅ Deleted point(s) with originalId=${pointId} from Qdrant`);
  } catch (error) {
    console.error(`Error deleting point ${pointId}:`, error);
    throw error;
  }
}

// Delete all points for a specific agent
export async function deleteAgentKnowledge(agentId: string) {
  try {
    await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
      filter: {
        must: [{ key: "agentId", match: { value: agentId } }],
      },
    });
    console.log(`✅ Deleted all knowledge for agent ${agentId} from Qdrant`);
  } catch (error) {
    console.error(`Error deleting knowledge for agent ${agentId}:`, error);
    throw error;
  }
}

// Get knowledge retrieval context for a chatbot
export async function getKnowledgeContext(agentId: string, query: string, embeddings: number[]): Promise<string> {
  try {
    console.log(`🔍 Searching Qdrant for agent ${agentId} with query: "${query.substring(0, 50)}..."`);
    
    const results = await searchVectors(embeddings, 5, agentId); // Top 5 results
    
    console.log(`📊 Found ${results.length} knowledge sources in vector database`);
    
    if (results.length === 0) {
      console.log(`⚠️ No knowledge found for agent ${agentId}. Make sure knowledge base is populated.`);
      return '';
    }
    
    // Log relevance scores
    results.forEach((result, idx) => {
      const contentPreview = typeof result.content === 'string' ? result.content.substring(0, 50) : '';
      console.log(`   Source ${idx + 1}: ${(result.score * 100).toFixed(1)}% relevant - ${contentPreview}...`);
    });
    
    // Format context from retrieved knowledge
    const context = results
      .filter(result => result.score > 0.3) // Only include results with >30% relevance
      .map((result, idx) => {
        return `[Source ${idx + 1}] (Relevance: ${(result.score * 100).toFixed(1)}%)\n${result.content}\n`;
      })
      .join('\n---\n\n');
    
    if (!context) {
      console.log(`⚠️ No relevant knowledge found (all scores < 30%)`);
      return '';
    }
    
    return `\n\n=== RELEVANT KNOWLEDGE FROM YOUR KNOWLEDGE BASE ===\n\n${context}\n\n=== END OF KNOWLEDGE BASE ===\n\nIMPORTANT: Use the above information to answer the user's question accurately. If the answer is in the knowledge base, cite it. If not, say you don't have that information.`;
  } catch (error) {
    console.error('❌ Error retrieving knowledge context:', error);
    return '';
  }
}
