export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface AgentTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  logoUrl?: string;
  position: 'bottom-right' | 'bottom-left';
  mode: 'light' | 'dark' | 'system';
  // Optional widget dimensions (e.g. '380px', '600px')
  width?: string;
  height?: string;
  // Optional launcher button label & colors (for SDK / embedded use)
  buttonLabel?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface AgentKnowledge {
  id: string;
  type: 'text' | 'url';
  content: string;
  // In DB this is a Date, but we may serialize/deserialize it,
  // so keep the type broad for safety.
  lastUpdated: number | string | Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  // Provider and model used for LLM calls
  provider: 'anthropic' | 'openai' | 'zypher-native';
  model: string;
  // Provider API key for this chatbot (OpenAI / Anthropic etc.)
  providerApiKey?: string | null;
  // Public API key used by the SDK/embed (generated server-side)
  apiKey?: string;
  systemInstruction: string;
  createdAt: number | string | Date;
  theme: AgentTheme;
  // Local-only knowledge representation (older UI) – kept for compatibility
  knowledgeBase: AgentKnowledge[];
  // Populated when loading from the API (Prisma relation)
  knowledgeSources?: AgentKnowledge[];
}

export const DEFAULT_THEME: AgentTheme = {
  primaryColor: '#3b82f6', // blue-500
  backgroundColor: '#ffffff',
  textColor: '#0f172a', // slate-900
  fontFamily: 'Inter',
  borderRadius: '0.75rem',
  position: 'bottom-right',
  mode: 'light'
};

export const INITIAL_AGENT: Agent = {
  id: 'new-agent',
  name: 'My New Assistant',
  description: 'A helpful support agent powered by Zypher',
  provider: 'openai',
  model: 'gpt-4o',
  providerApiKey: '',
  systemInstruction: 'You are a helpful customer support AI. Answer based on the provided context.',
  createdAt: Date.now(),
  theme: DEFAULT_THEME,
  knowledgeBase: []
};
