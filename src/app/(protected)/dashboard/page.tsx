'use client';

import BackgroundTexture from '@/components/BackgroundTexture';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { startBrowserSession, getAllRuns } from '@/services/api';
import type { AgentRun } from '@/services/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [objective, setObjective] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  
  useEffect(() => {
    const fetchAgentRuns = async () => {
      setIsLoadingRuns(true);
      try {
        const response = await getAllRuns();
        setAgentRuns(response.data.agentRuns);
      } catch (err) {
        console.error('Failed to fetch agent runs:', err);
      } finally {
        setIsLoadingRuns(false);
      }
    };

    fetchAgentRuns();
  }, []);

  const handleStartAgent = async () => {
    if (!objective.trim()) {
      toast.error('Please enter an objective for the agent');
      return;
    }

    setIsLoading(true);

    try {
      const data = await startBrowserSession(objective);
      console.log("data", data);
      router.push(`/browser/${data.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start browser session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-6xl bg-gradient-to-r from-[#1B1B1B] via-[#4A4A4A] to-[#1B1B1B] bg-clip-text text-transparent font-[var(--font-playfair)] tracking-tight leading-tight">
              Enter a goal for your browser agent.
            </h1>
            {/* <p className="text-[#1B1B1B]/60 mt-3 text-lg font-[var(--font-serif)]">Let AI handle your browser tasks while you focus on what matters</p> */}
          </div>

          {/* New Browser Task Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-[20px] sm:rounded-[28px] border border-black/5 p-4 sm:p-8 shadow-sm mb-8 sm:mb-12">
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe what you want the agent to do..."
              className="w-full h-24 sm:h-30 p-4 sm:p-6 rounded-[16px] sm:rounded-[20px] border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none text-base sm:text-lg"
              disabled={isLoading}
            />
            <button 
              onClick={handleStartAgent}
              disabled={isLoading}
              className={`mt-3 sm:mt-4 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-[14px] sm:rounded-[16px] text-sm sm:text-base font-medium transition-all ${
                isLoading 
                  ? 'bg-[#1B1B1B]/50 cursor-not-allowed' 
                  : 'bg-[#1B1B1B] hover:bg-[#2C2C2C] hover:shadow-lg'
              } text-white`}>
              {isLoading ? 'Starting Agent...' : 'Start Agent'}
            </button>
          </div>
        
          {/* Example Prompts Heading */}
          <div className="px-2 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-thin text-[#1B1B1B]">Examples</h2>
            <p className="text-sm text-[#1B1B1B]/60 mt-0.5 sm:mt-1">Click any example to try it out</p>
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setObjective(action.objective)}
                className="bg-white/70 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] border border-black/5 p-4 sm:p-6 text-left hover:shadow-md transition-shadow group"
              >
                <h3 className="text-sm sm:text-base font-medium text-[#1B1B1B] mb-1 sm:mb-2 group-hover:text-[#2C2C2C]">{action.title}</h3>
                <p className="text-xs sm:text-sm text-[#1B1B1B]/60">{action.description}</p>
              </button>
            ))}
          </div>

          {/* Past Runs Section */}
          <div className="mt-8 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-normal text-[#1B1B1B] mb-4 sm:mb-6">Past Runs</h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {isLoadingRuns ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">Loading agent runs...</div>
              ) : agentRuns.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">No agent runs found</div>
              ) : (
                agentRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => router.push(`/browser/${run.id}`)}
                    className="bg-white/70 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] border border-black/5 p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-[#1B1B1B] mb-2 sm:mb-4 ml-1 sm:ml-2 line-clamp-2">
                          Objective: {run.run_objective}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                            run.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            run.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                            run.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {run.status.toLowerCase()}
                          </span>
                          <span className="text-xs sm:text-sm text-[#1B1B1B]/40">
                            {new Date(run.started_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-[#1B1B1B]/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const quickActions = [
  // {
  //   title: 'Stock Price Check',
  //   description: 'Go to Google and search for Apple stock price, then tell me the current price and any recent trends',
  //   objective: 'Go to google.com, search for "AAPL stock price", and tell me the current price of Apple stock along with any significant price changes today.'
  // },
  {
    title: 'Amazon Watch Analysis',
    description: 'Search for watches on Amazon and analyze the first result',
    objective: 'Go to amazon.com, search for watches, click on the first watch result, and provide me with a detailed list of its features, price, and specifications.'
  }
]; 