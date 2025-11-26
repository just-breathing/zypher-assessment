'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function ChatbotTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 gradient-text">SDK Test Page</h1>
          <p className="text-muted-foreground mb-6">
            This page tests the embedded chatbot SDK. The chatbot should appear in the bottom-right corner.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <h2 className="font-semibold mb-2">✅ SDK Configuration</h2>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Agent ID: <code className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">cmifwaxg90003tvag931db99c</code></li>
                <li>• API Key: <code className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">cmifwaxg90004tvagddn2on70</code></li>
                <li>• Position: Bottom-right corner</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
              <h2 className="font-semibold mb-3">Test Content Area</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This is sample content to demonstrate how the chatbot appears alongside your existing page content.
                The chatbot widget should not interfere with the page layout.
              </p>
              <p className="text-sm text-muted-foreground">
                Click the chatbot button in the bottom-right corner to open the chat interface.
                You can customize its appearance using the theme settings in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SDK Integration */}
      <Script
        src="http://localhost:3000/sdk/chatbot.js"
        data-agent-id="cmig5fwri0003uj0bdbahtvw6"
        data-api-key="cmig5fwri0004uj0bjpc3cp87"
        strategy="afterInteractive"
      />
    </div>
  );
}