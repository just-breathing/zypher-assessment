"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import ChatbotList from "@/components/chatbot-list";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Bot, Sparkles, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ chatbots: 0, chats: 0, uptime: "99.9%" });

  useEffect(() => {
    if (!loading && !user) {
      redirect("/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <FadeIn direction="left">
              <div>
                <motion.h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 gradient-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome back, {user.name || user.email}
                </motion.h1>
                <motion.p 
                  className="text-muted-foreground text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Build and manage intelligent chatbots powered by your knowledge
                </motion.p>
              </div>
            </FadeIn>
            
            <FadeIn direction="right" delay={0.3}>
              <Link href="/dashboard/agents/new">
                <Button className="w-full sm:w-auto gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Chatbot
                </Button>
              </Link>
            </FadeIn>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
            <FadeIn delay={0.4}>
              <motion.div 
                className="glass-card p-6 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.chatbots}</p>
                    <p className="text-sm text-muted-foreground">Active Chatbots</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <motion.div 
                className="glass-card p-6 rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.chats}</p>
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <motion.div 
                className="glass-card p-6 rounded-xl sm:col-span-2 lg:col-span-1"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.uptime}</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Chatbot List Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn delay={0.7}>
          <ChatbotList userId={user.id} />
        </FadeIn>
      </div>
    </div>
  );
}
