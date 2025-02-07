'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackgroundTexture from '@/components/BackgroundTexture';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import '@/styles/animations.css';
import { Step } from '@/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// WebSocket connection URL
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-domain.com'
  : 'ws://localhost:8080';

export default function BrowserView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'inprogress' | 'completed' | 'failed'>('connecting');
  const router = useRouter();

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.access_token) {
          throw new Error('Authentication failed');
        }

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connection opened');
          if (ws) {
            ws.send(JSON.stringify({
              type: 'authenticate',
              token: session.access_token
            }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'existing_run':
                // Handle existing run data immediately as server will close connection
                setStatus(message.status.toLowerCase() as 'completed' | 'failed');
                if (message.steps) {
                  setSteps(message.steps);
                }
                setFinalAnswer(message.finalAnswer || `This run is already in ${message.status} state`);
                setIsConnected(false); // Since server will close connection
                break;

              case 'authentication':
                if (message.status === 'success') {
                  setIsConnected(true);
                  setConnectionFailed(false);
                  // Start the agent after successful authentication
                  ws?.send(JSON.stringify({
                    type: 'start_agent',
                    runId: resolvedParams.id
                  }));
                }
                break;

              case 'screenshot_update':
                setScreenshot(message.screenshot);
                break;

              case 'step_update':
                setSteps(prevSteps => [...prevSteps, message.step]);
                break;

              case 'completion':
                setStatus(message.status);
                setFinalAnswer(message.finalAnswer);
                // Close connection on completion
                ws?.close();
                break;

              default:
                console.log('Unhandled message type:', message.type);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
        };

        ws.onerror = () => {
          console.error('WebSocket error occurred');
          setConnectionFailed(true);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Connection failed:', error);
        setConnectionFailed(true);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [resolvedParams.id]);

  const renderBrowserContent = () => {
    if (status === 'completed' || status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-2xl font-semibold">
            Task {status === 'completed' ? 'Completed' : 'Failed'}
          </div>
        </div>
      );
    }

    return screenshot ? (
      <img 
        src={`data:image/png;base64,${screenshot}`} 
        alt="Browser Screenshot" 
        className="w-full h-full object-contain"
      />
    ) : (
      <div className="loading-circle">
        <div className="loading-ball bg-black/80"></div>
        <div className="loading-ball bg-black/60"></div>
        <div className="loading-ball bg-black/40"></div>
        <div className="loading-ball bg-black/20"></div>
      </div>
    );
  };

  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 min-h-screen bg-gray-50/50 backdrop-blur-sm p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-black to-gray-800 text-white text-sm px-3 py-1.5 rounded-full hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : connectionFailed ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              <span className="text-sm text-gray-600">
                {connectionFailed ? 'Connection failed' : isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-xl font-normal bg-gradient-to-r from-[#1B1B1B] to-[#4A4A4A] bg-clip-text text-transparent">
              Browser Automation
            </h1>
            <p className="text-[#1B1B1B]/60 mt-2">Session ID: {resolvedParams.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Browser Stream */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5 flex flex-col items-center justify-center bg-gray-50">
                {renderBrowserContent()}
              </div>
            </div>

            {/* Agent Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              <h2 className="text-2xl font-normal mb-6 text-[#1B1B1B]">Live Progress</h2>
              <div className="space-y-4">
                {steps.length > 0 ? (
                  <>
                    {steps.map((step, index) => (
                      <div key={index} className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                          <span className="font-medium text-gray-600">Step {step.number}</span>
                        </div>
    
                        <div className="p-4">
                          <div className="mb-4 rounded-lg bg-blue-50 p-3">
                            <div className="mb-1">
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                                Action
                              </span>
                            </div>
                            <div className="text-sm text-gray-800">{step.action}</div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-3">
                            <div className="mb-1">
                              <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                                Explanation
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{step.explanation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {finalAnswer && (status === 'completed' || status === 'failed') && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">Final Result</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {status === 'completed' ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-sm text-blue-600">{finalAnswer}</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Skeleton loading
                  [1, 2].map((index) => (
                    <div key={index} className="p-4 rounded-2xl bg-white/50 border border-black/5">
                      <div className="animate-pulse space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
                          <div className="w-16 h-4 bg-gray-100 rounded"></div>
                        </div>
                        <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                        <div className="space-y-2">
                          <div className="w-16 h-6 bg-gray-100 rounded-full"></div>
                          <div className="w-full h-4 bg-gray-100 rounded"></div>
                          <div className="w-2/3 h-4 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 