"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Agent, AgentKnowledge, DEFAULT_THEME } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatWidget } from "@/components/ChatWidget";

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [chatbot, setChatbot] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<AgentKnowledge[]>([]);
  const [newKnowledgeType, setNewKnowledgeType] = useState<'text' | 'url'>('text');
  const [newKnowledgeContent, setNewKnowledgeContent] = useState('');
  const [addingKnowledge, setAddingKnowledge] = useState(false);
  const [deletingKnowledge, setDeletingKnowledge] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [regeneratingApiKey, setRegeneratingApiKey] = useState(false);

  useEffect(() => {
    if (!chatbotId) return;

    const fetchChatbotAndApiKey = async () => {
      try {
        setLoading(true);
        const chatbotResponse = await fetch(`/api/agents/${chatbotId}`);
        if (!chatbotResponse.ok) {
          throw new Error("Failed to fetch chatbot");
        }
        const chatbotData: Agent = await chatbotResponse.json();
        setChatbot(chatbotData);
        setKnowledgeSources(chatbotData.knowledgeSources || []);

        const apiKeyResponse = await fetch(`/api/agents/${chatbotId}/apikey`);
        if (!apiKeyResponse.ok) {
          throw new Error("Failed to fetch API key");
        }
        const apiKeyData = await apiKeyResponse.json();
        setApiKey(apiKeyData.apiKey);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatbotAndApiKey();
  }, [chatbotId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChatbot((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleThemeChange = (name: keyof typeof DEFAULT_THEME, value: string) => {
    setChatbot((prev) =>
      prev
        ? { ...prev, theme: { ...(prev.theme || DEFAULT_THEME), [name]: value } }
        : null
    );
  };

  const handleModelChange = (value: string) => {
    setChatbot((prev) => (prev ? { ...prev, model: value } : null));
  };

// at top of file you already import Agent

const handleProviderChange = (value: Agent['provider']) => {
  setChatbot(prev => (prev ? { ...prev, provider: value, model: '' } : null));
};

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatbot) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/agents/${chatbotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: chatbot.name,
          description: chatbot.description,
          provider: chatbot.provider,
          model: chatbot.model,
          providerApiKey: chatbot.providerApiKey,
          systemInstruction: chatbot.systemInstruction,
          theme: chatbot.theme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update chatbot');
      }

      const updatedAgent = await response.json();
      setChatbot(updatedAgent);
      // toast({
      //   title: "Success",
      //   description: `Agent "${updatedAgent.name}" updated!`,
      // });
    } catch (err) {
      console.error('Error updating chatbot:', err);
      // toast({
      //   title: "Error",
      //   description: (err as Error).message,
      //   variant: "destructive",
      // });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/agents/${chatbotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete chatbot');
      }

      // toast({
      //   title: "Success",
      //   description: "Agent deleted successfully!",
      // });
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting chatbot:', err);
      // toast({
      //   title: "Error",
      //   description: (err as Error).message,
      //   variant: "destructive",
      // });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowledgeContent.trim()) return;

    setAddingKnowledge(true);
    try {
      const response = await fetch(`/api/agents/${chatbotId}/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newKnowledgeType,
          content: newKnowledgeContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add knowledge source');
      }

      const newSource: AgentKnowledge = await response.json();
      setKnowledgeSources((prev) => [...prev, newSource]);
      setNewKnowledgeContent('');
    } catch (err) {
      console.error('Error adding knowledge source:', err);
    } finally {
      setAddingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async (knowledgeId: string) => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) return;

    setDeletingKnowledge(knowledgeId);
    try {
      const response = await fetch(`/api/agents/${chatbotId}/knowledge`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ knowledgeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source');
      }

      setKnowledgeSources((prev) => prev.filter((s) => s.id !== knowledgeId));
    } catch (err) {
      console.error('Error deleting knowledge source:', err);
      alert('Failed to delete knowledge source');
    } finally {
      setDeletingKnowledge(null);
    }
  };

  const embedCode = `
<div id="zypher-chatbot-root"></div>
<script
  src="/sdk/chatbot.js"
  data-agent-id="${chatbotId}"
  data-api-key="${apiKey}"
  defer
></script>
`;

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading chatbot details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!chatbot) {
    return <div className="container mx-auto py-8 text-center text-muted-foreground">Chatbot not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 gradient-text">Manage Chatbot: {chatbot.name}</h1>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          <TabsTrigger value="knowledge">📚 Knowledge</TabsTrigger>
          <TabsTrigger value="embed">🔗 Embed</TabsTrigger>
          <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="mt-4">
          <form onSubmit={handleUpdate} className="glass-card p-6 rounded-xl space-y-6">
            <div>
              <Label htmlFor="name">Chatbot Name</Label>
              <Input id="name" name="name" value={chatbot.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={chatbot.description} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Model Provider</Label>
                <Select onValueChange={handleProviderChange} defaultValue={chatbot.provider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="zypher-native">Zypher Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Select onValueChange={handleModelChange} defaultValue={chatbot.model} disabled={!chatbot.provider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatbot.provider === 'anthropic' && (
                      <>
                        <SelectItem value="claude-sonnet-4-20250514">Claude 4 Sonnet (2025‑05‑14)</SelectItem>
                        <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                      </>
                    )}
                    {chatbot.provider === 'openai' && (
                      <>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </>
                    )}
                    {chatbot.provider === 'zypher-native' && (
                      <>
                        <SelectItem value="zypher-native">Zypher Native</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="providerApiKey">Provider API Key</Label>
              <Input
                id="providerApiKey"
                type="password"
                value={chatbot.providerApiKey || ''}
                onChange={(e) =>
                  setChatbot(prev => (prev ? { ...prev, providerApiKey: e.target.value } : null))
                }
                placeholder={`Enter your ${chatbot.provider || 'provider'} API key`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This key is stored securely and used only for this chatbot's model calls.
              </p>
            </div>
            <div>
              <Label htmlFor="systemInstruction">System Instruction</Label>
              <Textarea id="systemInstruction" name="systemInstruction" value={chatbot.systemInstruction} onChange={handleChange} rows={5} required />
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Theme & Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input id="primaryColor" type="color" value={chatbot.theme.primaryColor || ''} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input id="backgroundColor" type="color" value={chatbot.theme.backgroundColor || ''} onChange={(e) => handleThemeChange('backgroundColor', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input id="textColor" type="color" value={chatbot.theme.textColor || ''} onChange={(e) => handleThemeChange('textColor', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input id="fontFamily" name="fontFamily" value={chatbot.theme.fontFamily || ''} onChange={(e) => handleThemeChange('fontFamily', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Input id="borderRadius" name="borderRadius" value={chatbot.theme.borderRadius || ''} onChange={(e) => handleThemeChange('borderRadius', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  onValueChange={(value) => handleThemeChange('position', value)}
                  defaultValue={chatbot.theme.position || 'bottom-right'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="width">Widget Width</Label>
                <Input
                  id="width"
                  placeholder="e.g. 380px"
                  value={chatbot.theme.width || ''}
                  onChange={(e) => handleThemeChange('width', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="height">Widget Height</Label>
                <Input
                  id="height"
                  placeholder="e.g. 600px"
                  value={chatbot.theme.height || ''}
                  onChange={(e) => handleThemeChange('height', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buttonLabel">Launcher Button Label</Label>
                <Input
                  id="buttonLabel"
                  placeholder="e.g. Chat with us"
                  value={chatbot.theme.buttonLabel || ''}
                  onChange={(e) => handleThemeChange('buttonLabel', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buttonBgColor">Button Background</Label>
                <Input
                  id="buttonBgColor"
                  type="color"
                  value={chatbot.theme.buttonBgColor || chatbot.theme.primaryColor || '#3b82f6'}
                  onChange={(e) => handleThemeChange('buttonBgColor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buttonTextColor">Button Text Color</Label>
                <Input
                  id="buttonTextColor"
                  type="color"
                  value={chatbot.theme.buttonTextColor || '#ffffff'}
                  onChange={(e) => handleThemeChange('buttonTextColor', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete Chatbot
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <div className="glass-card p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground">Add context from text, URLs, files, or documents to enhance your chatbot's knowledge</p>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-4 p-6 rounded-xl bg-card/30 border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="newKnowledgeType" className="text-sm font-medium">Source Type</Label>
                  <Select onValueChange={(value: 'text' | 'url') => setNewKnowledgeType(value)} defaultValue={newKnowledgeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Text / JSON / Markdown</SelectItem>
                      <SelectItem value="url">🔗 URL / Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="newKnowledgeContent" className="text-sm font-medium">Content</Label>
                  <Textarea
                    id="newKnowledgeContent"
                    value={newKnowledgeContent}
                    onChange={(e) => setNewKnowledgeContent(e.target.value)}
                    placeholder={newKnowledgeType === 'url' ? 'https://example.com/docs or https://example.com/api/data.json' : 'Paste your text, JSON, or Markdown content here...'}
                    rows={newKnowledgeType === 'text' ? 4 : 2}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={addingKnowledge} className="w-full sm:w-auto">
                {addingKnowledge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Knowledge Source'
                )}
              </Button>
            </form>

            {knowledgeSources.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-card/20 border border-border/30">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No knowledge sources yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Add text, URLs, or documents to build your chatbot's knowledge graph
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Knowledge Sources ({knowledgeSources.length})
                </h3>
                {knowledgeSources.map((source) => (
                  <div key={source.id} className="p-4 rounded-lg bg-card/30 border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/10 text-primary">
                            {source.type === 'url' ? '🔗 URL' : '📝 TEXT'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Added {new Date(source.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2 font-mono">
                          {source.content.substring(0, 150)}...
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKnowledge(source.id)}
                        disabled={deletingKnowledge === source.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingKnowledge === source.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="embed" className="mt-4">
          <div className="glass-card p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Embed Chatbot</h2>
              <p className="text-sm text-muted-foreground">Deploy your chatbot anywhere with our simple SDK integration</p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-card/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Chatbot API Key</Label>
                  <p className="text-xs text-muted-foreground mt-1">Use this key for authenticated API requests</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="text" 
                  value={apiKey || 'Loading...'} 
                  readOnly 
                  className="font-mono text-sm bg-background"
                />
                <Button
                  variant="outline"
                  onClick={async () => {
                    setRegeneratingApiKey(true);
                    try {
                      const response = await fetch(`/api/agents/${chatbotId}/apikey`, { method: 'PUT' });
                      if (!response.ok) throw new Error('Failed to regenerate API key');
                      const data = await response.json();
                      setApiKey(data.apiKey);
                    } catch (err) {
                      console.error('Error regenerating API key:', err);
                    } finally {
                      setRegeneratingApiKey(false);
                    }
                  }}
                  disabled={regeneratingApiKey}
                >
                  {regeneratingApiKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Regenerate
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Embed Code</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                  }}
                >
                  📋 Copy Code
                </Button>
              </div>
              <div className="relative rounded-xl bg-zinc-900 p-6 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{embedCode}</code>
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Paste this code before the closing &lt;/body&gt; tag of your HTML
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>🚀</span> Quick Start Guide
                </h4>
                <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
                  <li>Copy the embed code above</li>
                  <li>Paste it into your website's HTML (before &lt;/body&gt;)</li>
                  <li>Your chatbot will appear in the bottom-right corner</li>
                  <li>Customize appearance in the Settings tab or with CSS</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <span>🎨</span> Full Theme Customization
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
                 This Widget supports light/dark modes and full CSS customization. Add this to your website:
                </p>
                <div className="relative rounded-lg bg-zinc-900 p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">{`<style>
  #zypher-chatbot-root {
    /* Light mode (default) */
    --widget-primary: ${chatbot.theme.primaryColor || '#3b82f6'};
    --widget-bg: ${chatbot.theme.backgroundColor || '#ffffff'};
    --widget-text: ${chatbot.theme.textColor || '#0f172a'};
    --widget-font: ${chatbot.theme.fontFamily || 'Inter'};
    --widget-radius: ${chatbot.theme.borderRadius || '0.75rem'};
  }
  
  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    #zypher-chatbot-root {
      --widget-bg: #1e293b;
      --widget-text: #f1f5f9;
    }
  }
  
  /* Or force dark mode with class */
  #zypher-chatbot-root.dark {
    --widget-primary: #60a5fa;
    --widget-bg: #0f172a;
    --widget-text: #f1f5f9;
  }
</style>`}</pre>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 text-xs">💡</span>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Pro tip:</strong> See the complete customization guide at{' '}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                      SDK_CUSTOMIZATION_GUIDE.md
                    </code>{' '}
                    for advanced styling, positioning, and theme switching.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="max-w-md mx-auto">
            <div className="rounded-xl bg-gray-100 dark:bg-zinc-800 shadow-inner overflow-hidden" style={{ height: chatbot.theme.height || '600px', width: chatbot.theme.width || '380px' }}>
              {chatbot && (
                <ChatWidget
                  agent={chatbot}
                  isPreview={true}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
