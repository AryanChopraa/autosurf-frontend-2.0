'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackgroundTexture from '@/components/BackgroundTexture';

// Dummy data for agent steps
const initialSteps = [
  {
    id: 1,
    action: 'Initializing browser connection...',
    thinking: 'Preparing to establish secure websocket connection',
    timestamp: new Date().toISOString(),
  }
];

export default function BrowserView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [steps, setSteps] = useState(initialSteps);
  const [currentImage, setCurrentImage] = useState('/dashboard-preview.png');
  const [isConnected, setIsConnected] = useState(false);
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);
  const router = useRouter();

  // Simulate socket connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      setSteps(prev => [...prev, {
        id: prev.length + 1,
        action: 'Browser connection established successfully!',
        thinking: 'Ready to start processing webpage interactions',
        timestamp: new Date().toISOString(),
      }]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Simulate receiving new steps
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setSteps(prev => {
        if (prev.length >= 10 && !showFinalAnswer) {
          setShowFinalAnswer(true);
          clearInterval(interval);
        }
        
        return [...prev, {
          id: prev.length + 1,
          action: `Action ${prev.length + 1}: ${Math.random() > 0.5 ? 'Clicking button' : 'Filling form'}`,
          thinking: `Analysis: ${Math.random() > 0.5 ? 'Evaluating page structure' : 'Processing user interface elements'}`,
          timestamp: new Date().toISOString(),
        }];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

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
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Connecting...'}
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
              {!isConnected ? (
                <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center bg-gray-50">
                  <p className="text-2xl text-gray-500 font-thin text-center px-8">
                    Stream will begin once broswer is setup...
                  </p>
                </div>
              ) : (
                <div className="relative h-[600px] rounded-2xl overflow-hidden border border-black/5">
                  <Image
                    src={currentImage}
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
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-2xl bg-white/50 border border-black/5"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Action
                          </span>
                          <span className="text-sm text-[#1B1B1B]/40">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[#1B1B1B]/80 ml-1">{step.action}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 w-fit">
                          Thinking
                        </span>
                        <p className="text-[#1B1B1B]/60 ml-1">{step.thinking}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {showFinalAnswer && (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Final Result
                      </span>
                    </div>
                    <p className="text-purple-700">Successfully completed all automated actions on the webpage!</p>
                  </div>
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
      `}</style>
    </>
  );
} 