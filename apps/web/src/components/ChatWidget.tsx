import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Agent, Message, Role } from '../types';
import { Icons } from './Icons';

interface ChatWidgetProps {
  agent: Agent;
  isPreview?: boolean;
  apiKey?: string; // Add apiKey prop
  baseUrl?: string; // Add baseUrl prop for SDK usage
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ agent, isPreview = false, apiKey, baseUrl }) => {
  const [isOpen, setIsOpen] = useState(isPreview);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: `Hello! I'm ${agent.name}. How can I help you today?`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Styling based on agent configuration
  const theme = agent.theme;
  
  // Custom CSS variable injection for the widget instance
  const style = {
    '--widget-primary': theme.primaryColor,
    '--widget-bg': theme.backgroundColor,
    '--widget-text': theme.textColor,
    '--widget-font': theme.fontFamily,
    '--widget-radius': theme.borderRadius,
  } as React.CSSProperties;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Keep preview open if commanded
  useEffect(() => {
    if(isPreview) setIsOpen(true);
  }, [isPreview]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: inputText,
      timestamp: Date.now(),
    };

    // Append user message
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Create a placeholder bot message for streaming updates
    const botId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: botId,
        role: Role.MODEL,
        text: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Use baseUrl if provided (for SDK usage), otherwise use relative path
      const apiUrl = baseUrl 
        ? `${baseUrl}/api/agents/${agent.id}/chat?stream=1`
        : `/api/agents/${agent.id}/chat?stream=1`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get agent response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read and append streamed chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      // Fallback error message
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== botId),
        {
          id: botId,
          role: Role.MODEL,
          text: 'I encountered an error connecting to the server.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`font-sans z-50 flex flex-col items-end ${
        !isPreview
          ? theme.position === 'bottom-left'
            ? 'fixed bottom-6 left-6'
            : 'fixed bottom-6 right-6'
          : 'w-full h-full relative'
      }`}
      style={style}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`flex flex-col shadow-2xl transition-all duration-300 mb-4 border border-gray-200 dark:border-gray-700
            ${isPreview ? 'w-full h-full rounded-(--widget-radius)' : 'rounded-(--widget-radius)'}
          `}
          style={{
            backgroundColor: 'var(--widget-bg)',
            color: 'var(--widget-text)',
            fontFamily: 'var(--widget-font)',
            width: !isPreview ? (theme.width || '380px') : '100%',
            height: !isPreview ? (theme.height || '600px') : '100%',
            maxHeight: !isPreview ? '85vh' : '100%',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: 'var(--widget-primary)', color: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Icons.Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{agent.name}</h3>
                <p className="text-xs opacity-90">Powered by Zypher</p>
              </div>
            </div>
            {!isPreview && (
              <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-75">
                <Icons.X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-sm shadow-sm rounded-lg ${
                    msg.role === Role.USER
                      ? 'rounded-br-none text-white'
                      : 'rounded-bl-none bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700'
                  }`}
                  style={msg.role === Role.USER ? { backgroundColor: 'var(--widget-primary)' } : {}}
                >
                  {msg.role === Role.MODEL ? (
                    <div className="space-y-1 break-words">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                  
                  {/* Sources / Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={`mt-3 pt-2 border-t flex flex-col gap-1 ${msg.role === Role.USER ? 'border-white/20' : 'border-gray-100 dark:border-gray-700'}`}>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-1`}>Sources</span>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 max-w-full truncate transition-colors
                                        ${msg.role === Role.USER 
                                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                                            : 'bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300'}
                                    `}
                                >
                                    <Icons.Globe className="w-3 h-3 shrink-0" />
                                    <span className="truncate max-w-[140px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-gray-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full bg-gray-100 dark:bg-zinc-800 text-sm p-3 pr-10 rounded-full outline-none focus:ring-2 focus:ring-opacity-50 transition-all dark:text-white"
                style={{ '--tw-ring-color': 'var(--widget-primary)' } as React.CSSProperties}
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 text-gray-500"
                style={{ color: inputText.trim() ? 'var(--widget-primary)' : undefined }}
              >
                <Icons.Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">Powered by ZypherNexus</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button (Only if not preview) */}
      {!isPreview && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: theme.buttonBgColor || 'var(--widget-primary)',
            color: theme.buttonTextColor || '#ffffff',
          }}
        >
          {theme.buttonLabel ? (
            <>
              <Icons.MessageSquare className="w-4 h-4 mr-2" />
              <span>{theme.buttonLabel}</span>
            </>
          ) : (
            <Icons.MessageSquare className="w-7 h-7" />
          )}
        </button>
      )}
    </div>
  );
};