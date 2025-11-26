"use client";

import React, { useEffect, useState } from "react";
import { Agent, INITIAL_AGENT } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";


interface AgentListProps {
  userId: string;
}

const AgentList: React.FC<AgentListProps> = ({ userId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { toast } = useToast(); // Uncomment when toast is fixed

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agents");
        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }
        const data: Agent[] = await response.json();
        setAgents(data);
      } catch (err) {
        setError((err as Error).message);
        // toast({
        //   title: "Error",
        //   description: "Failed to load agents.",
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [userId]);

  if (loading) {
    return <div className="text-center">Loading agents...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link href="/dashboard/new-agent" passHref>
          <Button>Create New Agent</Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <p className="text-center text-gray-500">No agents created yet. Create your first agent!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-zinc-700">
              <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 truncate">{agent.description}</p>
              <div className="flex justify-end gap-2">
                <Link href={`/dashboard/agent/${agent.id}`} passHref>
                  <Button variant="outline" size="sm">View/Edit</Button>
                </Link>
                {/* Add delete functionality later */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentList;
