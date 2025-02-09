'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundTexture from '@/components/BackgroundTexture';
import ResultDialog from '@/components/ResultDialog';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import '@/styles/animations.css';
import { Step } from '@/types';
import { createAutomation } from '@/services/api';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// WebSocket connection URL
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://api.autosurf.tech/agent'
  : 'ws://localhost:8080/agent';

export default function BrowserView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'inprogress' | 'completed' | 'failed'>('connecting');
  const [showDialog, setShowDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [automationName, setAutomationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const agentStarted = useRef(false);

  const handleSaveAutomation = async () => {
    if (!automationName.trim()) {
      toast.error('Please enter an automation name');
      return;
    }

    setIsSaving(true);
    try {
      await createAutomation({
        automationName: automationName.trim(),
        agentRunId: resolvedParams.id
      });
      toast.success('Automation saved successfully!');
      setShowSaveDialog(false);
      setAutomationName('');
    } catch (error: any) {
      toast.error(error || 'Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

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
                setShowDialog(true);
                break;

              case 'authentication':
                if (message.status === 'success') {
                  setIsConnected(true);
                  setConnectionFailed(false);
                  // Only start the agent if we haven't already
                  if (!agentStarted.current) {
                    agentStarted.current = true;
                    ws?.send(JSON.stringify({
                      type: 'start_agent',
                      runId: resolvedParams.id
                    }));
                  }
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
                setShowDialog(true);
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
      // Reset the ref when the component unmounts
      agentStarted.current = false;
    };
  }, [resolvedParams.id]);

  const renderBrowserContent = () => {
    // Only show completion screen for existing runs
    if ((status === 'completed' || status === 'failed') && steps.length === 0) {
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : connectionFailed ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <span className="text-sm text-gray-600">
                  {connectionFailed ? 'Connection failed' : isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              {(status === 'completed' || status === 'failed') && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={status === 'failed'}
                  className={`flex items-center gap-1.5 bg-gradient-to-r ${
                    status === 'failed' 
                      ? 'from-gray-400 to-gray-500 opacity-50 cursor-not-allowed' 
                      : 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                  } text-white text-sm px-3 py-1.5 rounded-full transition-all shadow-sm`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save as Automation
                </button>
              )}
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
              <div className="relative">
                <div className="space-y-4 h-[520px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border [&::-webkit-scrollbar-track]:border-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white">
                  {steps.length > 0 ? (
                    <div className="space-y-4 pb-2">
                      {steps.map((step, index) => (
                        <div key={index} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
                        <div className={`rounded-2xl border p-4 ${status === 'completed' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>Final Result</span>
                            <span className={`text-xs rounded-full px-2 py-1 ${status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {status === 'completed' ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <p className={`text-sm ${status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>{finalAnswer}</p>
                        </div>
                      )}
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

        {/* Result Dialog */}
        <ResultDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          status={status === 'completed' ? 'completed' : 'failed'}
          finalAnswer={finalAnswer}
        />

        {/* Save Automation Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-4">Save Automation</h3>
              <div className="mb-4">
                <label htmlFor="automationName" className="block text-sm font-medium text-gray-700 mb-1">
                  Automation Name
                </label>
                <input
                  type="text"
                  id="automationName"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter automation name"
                  disabled={isSaving}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setAutomationName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAutomation}
                  disabled={isSaving || !automationName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 