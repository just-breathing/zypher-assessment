"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Zap, Code, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Bot,
      title: "Custom Knowledge Base",
      description: "Upload files, URLs, JSON, or Markdown to build a powerful knowledge graph for your chatbot"
    },
    {
      icon: Zap,
      title: "Multiple AI Models",
      description: "Choose from various AI providers and models. Use your own API keys for complete control"
    },
    {
      icon: Code,
      title: "Easy Integration",
      description: "Deploy anywhere with our simple SDK. Integrate into your website or app in minutes"
    }
  ];

  const benefits = [
    "Build chatbots with custom context",
    "Support for multiple file formats",
    "Knowledge graph architecture",
    "Bring your own API keys",
    "Easy SDK integration",
    "Deploy on any platform"
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Chatbot Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight">
              Build Intelligent Chatbots
              <br />
              Powered by Your Knowledge
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create AI chatbots with custom context from files, URLs, and documents. Deploy anywhere with our simple SDK.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gradient-primary shadow-lg shadow-primary/20 group text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build, customize, and deploy intelligent chatbots with ease
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 gradient-text">
                  Why Choose Zypher AI?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our platform provides everything you need to create intelligent, context-aware chatbots that understand your business.
                </p>
                <div className="grid gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-semibold mb-2">1. Upload Context</h4>
                    <p className="text-sm text-muted-foreground">
                      Add your knowledge sources - files, URLs, or text content
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-semibold mb-2">2. Configure & Train</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose your AI model and customize the chatbot behavior
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-semibold mb-2">3. Deploy Anywhere</h4>
                    <p className="text-sm text-muted-foreground">
                      Use our SDK to integrate your chatbot into any platform
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12 rounded-2xl text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create your first intelligent chatbot in minutes
            </p>
            <Link href="/signup">
              <Button size="lg" className="gradient-primary shadow-lg shadow-primary/20 group text-lg px-8">
                Start Building Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
