/**
 * Embeddings Generation using Transformers.js
 * 100% Free, No API Key Needed, Runs Locally
 */

import { pipeline } from '@xenova/transformers';

let embedder: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!embedder) {
      console.log('🤖 Initializing embedding model (first time only)...');
      // Initialize the model (downloads once ~23MB, then cached)
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('✅ Embedding model ready!');
    }
    
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding with Transformers.js:", error);
    throw error;
  }
}

/**
 * Alternative implementations (commented out):
 * 
 * 1. Hugging Face API (Free tier)
 * 2. Ollama (Local)
 * 3. OpenAI (Paid)
 * 4. Google Gemini (Requires API key)
 * 
 * See EMBEDDINGS_SETUP.md for details
 */
