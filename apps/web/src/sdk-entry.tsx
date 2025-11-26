import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// Extend Window interface
declare global {
  interface Window {
    ZypherChatbotSDK: {
      init: (agentId: string, rootId: string, apiKey: string, baseUrl?: string) => Promise<void>;
    };
    ZYPHER_BASE_URL?: string;
  }
}

// Global SDK initialization function
window.ZypherChatbotSDK = {
  init: async (agentId: string, rootId: string, apiKey: string, baseUrl?: string) => {
    try {
      // Use provided baseUrl or fallback to window.ZYPHER_BASE_URL or current origin
      const apiBaseUrl = baseUrl || window.ZYPHER_BASE_URL || window.location.origin;
      console.log('Initializing Zypher Chatbot SDK...', { agentId, rootId, apiBaseUrl });

      // Fetch agent configuration from API
      const response = await fetch(`${apiBaseUrl}/api/agents/${agentId}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent configuration: ${response.statusText}`);
      }

      const agent = await response.json();
      console.log('Agent configuration loaded:', agent.name);

      // Get the root element
      const rootElement = document.getElementById(rootId);
      if (!rootElement) {
        throw new Error(`Root element with id "${rootId}" not found`);
      }

      // Render the ChatWidget
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <ChatWidget agent={agent} isPreview={false} apiKey={apiKey} baseUrl={apiBaseUrl} />
        </React.StrictMode>
      );

      console.log('Zypher Chatbot SDK initialized successfully!');
    } catch (error) {
      console.error('Zypher Chatbot SDK initialization error:', error);
    }
  },
};

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  console.log('Zypher Chatbot SDK loaded');
}

