'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackgroundTexture from '@/components/BackgroundTexture';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// WebSocket connection URL - use secure WebSocket by default
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-domain.com'
  : 'ws://localhost:8080';

interface Step {
  number: number;
  id: string;
  action: string;
  explanation: string;
  timestamp: string;
  screenshot?: string;
}

interface WebSocketMessage {
  type: 'authentication' | 'step_update' | 'completion' | 'error' | 'existing_run';
  status?: 'completed' | 'failed' | 'success';
  error?: string;
  stepNumber?: number;
  screenshot?: string;
  action?: string;
  explanation?: string;
  finalAnswer?: string;
  steps?: Step[];
  commands?: any[];
  run_objective?: string;
}

enum WebSocketErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  MESSAGE_ERROR = 'MESSAGE_ERROR',
  AGENT_ERROR = 'AGENT_ERROR',
}

interface WebSocketError {
  type: WebSocketErrorType;
  message: string;
  timestamp: string;
  fatal?: boolean;
}

interface HeartbeatMessage {
  type: 'heartbeat';
  timestamp: string;
}

interface AgentState {
  isAuthenticated: boolean;
  isRunning: boolean;
  lastHeartbeat: string | null;
}

class AgentWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval?: number;
  private reconnectTimeout?: NodeJS.Timeout;
  private isIntentionallyClosed = false;
  private onStepUpdate?: (step: Step) => void;
  private onConnectionChange?: (status: boolean) => void;
  private onError?: (error: WebSocketError) => void;
  private onCompletion?: (finalAnswer: string, steps: Step[], commands: string[]) => void;
  private state: AgentState = {
    isAuthenticated: false,
    isRunning: false,
    lastHeartbeat: null
  };

  constructor(
    private serverUrl: string,
    private runId: string,
    onStepUpdate: (step: Step) => void,
    onConnectionChange: (status: boolean) => void,
    onError: (error: WebSocketError) => void,
    onCompletion: (finalAnswer: string, steps: Step[], commands: string[]) => void
  ) {
    this.onStepUpdate = onStepUpdate;
    this.onConnectionChange = onConnectionChange;
    this.onError = onError;
    this.onCompletion = onCompletion;
    this.connect();
  }

  private async getAuthToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session?.access_token) {
        throw new Error('No session found');
      }
      return session.access_token;
    } catch (error) {
      this.handleError(WebSocketErrorType.AUTHENTICATION_ERROR, 'Failed to get authentication token', true);
      return null;
    }
  }

  private async connect() {
    try {
      if (this.isIntentionallyClosed) {
        return;
      }

      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Clear any existing connection
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket(this.serverUrl);
      this.setupEventListeners(token);
      this.startHeartbeat();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      this.handleError(
        WebSocketErrorType.CONNECTION_ERROR,
        `Failed to establish WebSocket connection: ${errorMessage}`,
        this.reconnectAttempts >= this.maxReconnectAttempts
      );
      this.handleReconnect();
    }
  }

  private setupEventListeners(token: string) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connection opened');
      this.authenticate(token);
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
    };

    this.ws.onmessage = async (event) => {
      console.log('Raw WebSocket message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        await this.handleMessage(message);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        this.handleError(
          WebSocketErrorType.MESSAGE_ERROR,
          'Failed to process message from server'
        );
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', { code: event.code, reason: event.reason });
      this.state.isAuthenticated = false;
      this.state.isRunning = false;
      this.onConnectionChange?.(false);
      
      if (!this.isIntentionallyClosed) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Connection error occurred';
      console.error('WebSocket error:', errorMessage);
      
      this.handleError(
        WebSocketErrorType.CONNECTION_ERROR,
        `WebSocket connection error: ${errorMessage}`,
        this.reconnectAttempts >= this.maxReconnectAttempts
      );
      this.onConnectionChange?.(false);
    };
  }

  private handleError(type: WebSocketErrorType, message: string, fatal: boolean = false) {
    const error: WebSocketError = {
      type,
      message,
      timestamp: new Date().toISOString(),
      fatal
    };

    this.onError?.(error);

    // Only add error step to the timeline if we're already connected and running
    if (this.state.isAuthenticated && this.state.isRunning) {
      this.onStepUpdate?.({
        number: Date.now(),
        id: `error-${Date.now()}`,
        action: 'Error',
        explanation: message,
        timestamp: new Date().toISOString(),
        screenshot: undefined
      });
    }
  }

  private authenticate(token: string) {
    this.sendMessage({
      type: 'authenticate',
      token
    });
  }

  private async handleMessage(message: WebSocketMessage) {
    try {
      console.log('Received message:', message);
      
      // Handle completion or existing run first
      if  (message.status === 'completed' || message.status === 'failed') {
        console.log('Run is completed/failed, handling completion...');
        const finalAnswer = message.finalAnswer || 'Task completed';
        const steps = message.steps || [];
        const commands = message.commands || [];
        this.onCompletion?.(finalAnswer, steps, commands);
        // Close connection as we don't need it for completed runs
        this.close();
        return;
      }

      switch (message.type) {
        case 'authentication':
          console.log('Authentication status:', message.status);
          if (message.status === 'success') {
            console.log('Authentication successful, setting state...');
            this.state.isAuthenticated = true;
            console.log('Current state:', this.state);
            await this.startAgent();
          } else {
            console.log('Authentication failed:', message.error);
            this.state.isAuthenticated = false;
            this.handleError(
              WebSocketErrorType.AUTHENTICATION_ERROR,
              message.error || 'Authentication failed',
              true
            );
          }
          break;

        case 'step_update':
          console.log('Step update received:', message);
          if (message.stepNumber && message.action && message.explanation) {
            this.onStepUpdate?.({
              number: message.stepNumber,
              id: `step-${message.stepNumber}-${Date.now()}`,
              action: message.action,
              explanation: message.explanation,
              timestamp: new Date().toISOString(),
              screenshot: message.screenshot
            });
          }
          break;

        case 'error':
          console.log('Error received:', message.error);
          this.handleError(
            WebSocketErrorType.AGENT_ERROR,
            message.error || 'Unknown error occurred',
            true
          );
          break;
      }
    } catch (error) {
      console.error('Message handling error:', error);
      this.handleError(
        WebSocketErrorType.MESSAGE_ERROR,
        'Failed to process message: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  private async startAgent() {
    console.log('Starting agent...');
    console.log('Current state:', this.state);
    
    if (this.state.isRunning) {
      console.warn('Agent is already running, skipping start');
      return;
    }

    if (!this.state.isAuthenticated) {
      console.warn('Not authenticated, cannot start agent');
      return;
    }

    console.log('Setting agent to running state...');
    this.state.isRunning = true;
    
    const startMessage = {
      type: 'start_agent',
      runId: this.runId,
      timestamp: new Date().toISOString()
    };
    console.log('Sending start message:', startMessage);
    this.sendMessage(startMessage);
  }

  private sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat() {
    // Clear any existing heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
      }
    }, 15000); // Send heartbeat every 15 seconds (half of server's 30-second timeout)
  }

  private handleReconnect() {
    // Don't reconnect if the connection was intentionally closed
    if (this.isIntentionallyClosed) {
      console.log('Connection was intentionally closed, skipping reconnect');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handleError(
        WebSocketErrorType.CONNECTION_ERROR,
        'Maximum reconnection attempts reached. Please refresh the page or try again later.',
        true
      );
      return;
    }

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    console.log(`Attempting to reconnect in ${Math.round(delay/1000)} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  public close() {
    console.log('Closing WebSocket connection intentionally');
    this.isIntentionallyClosed = true;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default function BrowserView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [commands, setCommands] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    let wsClient: AgentWebSocketClient | null = null;
    let isInitialized = false;

    const handleStepUpdate = (step: Step) => {
      console.log('Step update received:', step);
      setSteps(prev => [...prev, step]);
      if (step.screenshot) {
        setCurrentImage(step.screenshot);
      }
    };

    const handleConnectionChange = (status: boolean) => {
      console.log('Connection status changed:', status);
      setIsConnected(status);
      if (status) {
        setConnectionFailed(false);
      }
    };

    const handleError = (wsError: WebSocketError) => {
      console.error('WebSocket error occurred:', wsError);
      if (wsError.fatal && !isInitialized) {
        setConnectionFailed(true);
        toast.error(wsError.message);
        isInitialized = true;
      }
    };

    const handleCompletion = (answer: string, finalSteps: Step[], executedCommands: string[]) => {
      console.log('Task completed:', { answer, stepsCount: finalSteps.length, commandsCount: executedCommands.length });
      setFinalAnswer(answer);
      setSteps(finalSteps);
      setCommands(executedCommands);
    };

    wsClient = new AgentWebSocketClient(
      WS_URL,
      resolvedParams.id,
      handleStepUpdate,
      handleConnectionChange,
      handleError,
      handleCompletion
    );

    return () => {
      console.log('Cleaning up WebSocket client');
      wsClient?.close();
    };
  }, [resolvedParams.id]);

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
              Aim: Go and search the stock price of Apple
            </h1>
            <p className="text-[#1B1B1B]/60 mt-2">Session ID: {resolvedParams.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Browser Stream */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              {(!isConnected || !currentImage) ? (
                <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5 flex flex-col items-center justify-center bg-gray-50">
                  {!connectionFailed ? (
                    <LoadingState isConnected={isConnected} />
                  ) : (
                    <ErrorState />
                  )}
                </div>
              ) : (
                <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5">
                  <Image
                    src={`data:image/jpeg;base64,${currentImage}`}
                    alt="Browser Stream"
                    layout="fill"
                    objectFit="contain"
                    className="bg-white"
                  />
                </div>
              )}
            </div>

            {/* Agent Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[28px] border border-black/5 p-6 shadow-sm">
              <h2 className="text-2xl font-normal mb-6 text-[#1B1B1B]">Live Progress</h2>
              <div 
                className="space-y-4 overflow-auto max-h-[550px] pr-4 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E5E7EB transparent'
                }}
              >
                {isConnected && steps.length > 0 ? (
                  <>
                    {steps.map((step) => (
                      <StepCard key={`step-${step.number}-${step.id}`} step={step} />
                    ))}
                    {finalAnswer && (
                      <>
                        <FinalAnswerCard answer={finalAnswer} />
                        {commands.length > 0 && (
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                Executed Commands
                              </span>
                            </div>
                            <div className="space-y-2">
                              {commands.map((cmd, index) => (
                                <div key={`command-${index}`} className="text-sm text-gray-600 font-mono bg-white p-2 rounded">
                                  {cmd}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <LoadingSteps />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 20px;
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.7; }
          100% { opacity: 0.4; }
        }
        .animate-pulse-custom {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-25px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .loading-circle {
          width: 120px;
          height: 120px;
          position: relative;
          animation: rotate 8s linear infinite;
        }
        .loading-ball {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000;
          animation: bounce 1s infinite;
        }
        .loading-ball:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); animation-delay: -0.1s; }
        .loading-ball:nth-child(2) { top: 50%; right: 0; transform: translateY(-50%); animation-delay: -0.2s; }
        .loading-ball:nth-child(3) { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: -0.3s; }
        .loading-ball:nth-child(4) { top: 50%; left: 0; transform: translateY(-50%); animation-delay: -0.4s; }
      `}</style>
    </>
  );
}

// Separate components for better organization
const LoadingState = ({ isConnected }: { isConnected: boolean }) => (
  <>
    <div className="loading-circle">
      <div className="loading-ball bg-black/80"></div>
      <div className="loading-ball bg-black/60"></div>
      <div className="loading-ball bg-black/40"></div>
      <div className="loading-ball bg-black/20"></div>
    </div>
    <p className="text-2xl text-gray-500 font-thin text-center px-8 mt-8">
      {isConnected ? 'Stream is starting...' : 'Connecting to browser...'}
    </p>
    <p className="text-sm text-gray-400 mt-2">
      {isConnected ? 'Setting up your automated browser session' : 'Establishing secure connection'}
    </p>
  </>
);

const ErrorState = () => (
  <p className="text-2xl text-gray-500 font-thin text-center px-8">
    Connection failed. Please try refreshing the page.
  </p>
);

const StepCard = ({ step }: { step: Step }) => (
  <div className="p-4 rounded-2xl bg-white/50 border border-black/5">
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
            Step {step.number}
          </span>
          <span className="text-sm text-[#1B1B1B]/40">
            {new Date(step.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-[#1B1B1B]/80 ml-1">{step.action}</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 w-fit">
          Explanation
        </span>
        <p className="text-[#1B1B1B]/60 ml-1">{step.explanation}</p>
      </div>
    </div>
  </div>
);

const FinalAnswerCard = ({ answer }: { answer: string }) => (
  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
    <div className="flex items-center gap-2 mb-2">
      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
        Final Result
      </span>
    </div>
    <p className="text-purple-700">{answer}</p>
  </div>
);

const LoadingSteps = () => (
  <div className="space-y-4">
    {[1, 2].map((index) => (
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
    ))}
  </div>
); 