"use client";

import React, { useEffect, useState } from "react";
import { Agent } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Edit, Trash2, ExternalLink, Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ChatbotListProps {
  userId: string;
}

const ChatbotList: React.FC<ChatbotListProps> = ({ userId }) => {
  const [chatbots, setChatbots] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agents");
        if (!response.ok) {
          throw new Error("Failed to fetch chatbots");
        }
        const data: Agent[] = await response.json();
        setChatbots(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatbots();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your chatbots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <Sparkles className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">Error: {error}</p>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="glass-card p-12 rounded-2xl text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 gradient-text">No chatbots yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI-powered chatbot with custom knowledge and deploy it anywhere
          </p>
          <Link href="/dashboard/agents/new">
            <Button className="gradient-primary shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First Chatbot
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Your Chatbots</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and deploy your AI-powered chatbots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((chatbot, index) => (
          <motion.div
            key={chatbot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {chatbot.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{chatbot.provider}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                {chatbot.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Code className="w-3 h-3" />
                <span>{chatbot.model}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/agent/${chatbot.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Configure
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="px-3">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChatbotList;

