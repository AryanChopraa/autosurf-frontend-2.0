'use client';

import { useState, useEffect, use, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackgroundTexture from '@/components/BackgroundTexture';
import ResultDialog from '@/components/ResultDialog';
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
  : 'ws://localhost:8080/automation';

interface SavedAutomationStep {
  number: number;
  status: 'executing' | 'completed';
}

export default function SavedAutomationView({ params }: { params: Promise<{ id: string }> }) {
  console.log('[SavedAutomationView] Component mounted');
  const resolvedParams = use(params);
  console.log('[SavedAutomationView] Resolved params:', resolvedParams);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [steps, setSteps] = useState<SavedAutomationStep[]>([]);
  const [status, setStatus] = useState<'connecting' | 'inprogress' | 'completed' | 'failed'>('connecting');
  const [showDialog, setShowDialog] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const router = useRouter();
  const agentStarted = useRef(false);

  useEffect(() => {
    console.log('[WebSocket] Starting WebSocket connection setup');
    let ws: WebSocket | null = null;

    const connectWebSocket = async () => {
      try {
        console.log('[WebSocket] Getting auth session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.access_token) {
          console.error('[WebSocket] Authentication failed:', error);
          throw new Error('Authentication failed');
        }
        console.log('[WebSocket] Auth session retrieved successfully');

        ws = new WebSocket(WS_URL);
        console.log('[WebSocket] WebSocket instance created with URL:', WS_URL);

        ws.onopen = () => {
          console.log('[WebSocket] Connection opened');
          if (ws) {
            const authMessage = {
              type: 'authenticate',
              token: session.access_token
            };
            console.log('[WebSocket] Sending authentication message:', { ...authMessage, token: '***' });
            ws.send(JSON.stringify(authMessage));
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('[WebSocket] Received message:', message);
            
            switch (message.type) {
              case 'authentication':
                if (message.status === 'success') {
                  console.log('[WebSocket] Authentication successful');
                  setIsConnected(true);
                  setConnectionFailed(false);
                  if (!agentStarted.current) {
                    agentStarted.current = true;
                    const startMessage = {
                      type: 'start_script',
                      automationId: resolvedParams.id
                    };
                    console.log('[WebSocket] Starting script:', startMessage);
                    ws?.send(JSON.stringify(startMessage));
                  }
                }
                break;

              case 'screenshot_update':
                console.log('[WebSocket] Received screenshot update');
                setScreenshot(message.screenshot);
                break;

              case 'step_started':
                console.log('[WebSocket] Step started:', message.number);
                setSteps(prevSteps => {
                  const newSteps = [...prevSteps, { 
                    number: message.number,
                    status: 'executing' as const
                  }];
                  console.log('[State] Updated steps:', newSteps);
                  return newSteps;
                });
                break;

              case 'step_completed':
                console.log('[WebSocket] Step completed:', message.number);
                setSteps(prevSteps => {
                  const updatedSteps = prevSteps.map(step => 
                    step.number === message.number 
                      ? { ...step, status: 'completed' as const } 
                      : step
                  );
                  console.log('[State] Updated steps after completion:', updatedSteps);
                  return updatedSteps;
                });
                break;

              case 'captcha_detected':
                console.log('[WebSocket] CAPTCHA detected');
                toast.loading('Solving CAPTCHA...');
                break;

              case 'captcha_solved':
                console.log('[WebSocket] CAPTCHA solved');
                toast.success('CAPTCHA solved successfully!');
                break;

              case 'completion':
                console.log('[WebSocket] Automation completed:', message);
                setStatus('completed');
                setFinalAnswer(message.message);
                setShowDialog(true);
                ws?.close();
                break;

              case 'failed':
                console.error('[WebSocket] Automation failed:', message.error);
                setStatus('failed');
                setFinalAnswer(message.error);
                setShowDialog(true);
                ws?.close();
                break;

              default:
                console.warn('[WebSocket] Unhandled message type:', message.type);
            }
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Connection closed');
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] Error occurred:', error);
          setConnectionFailed(true);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        setConnectionFailed(true);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        console.log('[WebSocket] Cleaning up WebSocket connection');
        ws.close();
      }
      console.log('[State] Resetting agentStarted ref');
      agentStarted.current = false;
    };
  }, [resolvedParams.id]);

  const renderBrowserContent = () => {
    console.log('[Render] Rendering browser content. Status:', status);
    if (status === 'completed' || status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-6xl font-thin text-gray-500">
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

  console.log('[Render] Current state:', {
    isConnected,
    connectionFailed,
    status,
    stepsCount: steps.length,
    hasScreenshot: !!screenshot,
    showDialog
  });

  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 min-h-screen bg-gray-50/50 backdrop-blur-sm p-6 ">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/saved-automations')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-black to-gray-800 text-white text-sm px-3 py-1.5 rounded-full hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Saved Automations
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
              Running Saved Automation
            </h1>
            <p className="text-[#1B1B1B]/60 mt-2">Automation ID: {resolvedParams.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Browser Stream */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5 flex flex-col items-center justify-center bg-gray-50">
                {renderBrowserContent()}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              <h2 className="text-2xl font-normal mb-6 text-[#1B1B1B]">Live Progress</h2>
              <div className="relative">
                <div className="space-y-4 h-[520px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border [&::-webkit-scrollbar-track]:border-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white">
                  {steps.length > 0 ? (
                    <div className="space-y-4 pb-2">
                      {steps.map((step) => (
                        <div key={step.number} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-600">Step {step.number}</span>
                              <span className={`text-xs rounded-full px-2 py-1 ${
                                step.status === 'completed' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {step.status === 'completed' ? 'Completed' : 'Executing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Skeleton loading
                    [1, 2].map((index) => (
                      <div key={index} className="p-4 rounded-2xl bg-white/50 border border-black/5">
                        <div className="animate-pulse space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
                            <div className="w-16 h-4 bg-gray-100 rounded"></div>
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

        {/* Result Dialog */}
        <ResultDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          status={status === 'completed' ? 'completed' : 'failed'}
          finalAnswer={finalAnswer}
        />
      </div>
    </>
  );
}
