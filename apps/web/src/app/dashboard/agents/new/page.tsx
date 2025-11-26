'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Bot, Key, FileText, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NewChatbotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    model: '',
    providerApiKey: '',
    systemInstruction: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create chatbot');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    setFormData({ ...formData, provider: value, model: '' });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Create New Chatbot</h1>
            <p className="text-muted-foreground">Build an intelligent chatbot with custom knowledge</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6 p-6 rounded-xl bg-card/30 border border-border/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Chatbot Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Bot"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your chatbot does and how it helps users..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* AI Model Configuration */}
          <div className="space-y-6 p-6 rounded-xl bg-card/30 border border-border/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Model Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="provider">Model Provider *</Label>
                <Select onValueChange={handleProviderChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Select 
                  onValueChange={(value) => setFormData({ ...formData, model: value })} 
                  disabled={!formData.provider}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.provider === 'anthropic' && (
                      <>
                        <SelectItem value="claude-sonnet-4-20250514">Claude 4 Sonnet (2025‑05‑14)</SelectItem>
                        <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                      </>
                    )}
                    {formData.provider === 'openai' && (
                      <>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> API Key *
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={`Enter your ${formData.provider ? formData.provider : 'provider'} API key`}
                value={formData.providerApiKey}
                onChange={(e) => setFormData({ ...formData, providerApiKey: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary">💡</span>
                Your API key is encrypted and stored securely. It's used only for this chatbot.
              </p>
            </div>
          </div>

          {/* Behavior & Instructions */}
          <div className="space-y-6 p-6 rounded-xl bg-card/30 border border-border/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Behavior & Instructions
            </h3>

            <div className="space-y-2">
              <Label htmlFor="systemInstruction">System Instructions *</Label>
              <Textarea
                id="systemInstruction"
                placeholder="You are a helpful customer support assistant. You help users with product questions and provide accurate information based on the knowledge base..."
                value={formData.systemInstruction}
                onChange={(e) => setFormData({ ...formData, systemInstruction: e.target.value })}
                required
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define how your chatbot should behave and respond to users
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>
                After creating your chatbot, you can add knowledge sources (files, URLs, documents) to build its knowledge base.
              </span>
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Chatbot...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Create Chatbot
              </div>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
