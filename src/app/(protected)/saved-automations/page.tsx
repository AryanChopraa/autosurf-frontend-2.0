'use client';

import { useState } from 'react';
import { PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BackgroundTexture from '@/components/BackgroundTexture';

// This would come from your API/database
const mockAutomations = [
  {
    id: '1',
    name: 'Amazon Price Tracker',
    description: 'Tracks prices of selected products on Amazon',
    lastRun: '2024-02-05',
    status: 'active'
  },
  {
    id: '2',
    name: 'LinkedIn Job Scraper',
    description: 'Collects job postings based on specified criteria',
    lastRun: '2024-02-04',
    status: 'active'
  },
  {
    id: '3',
    name: 'Email Automation',
    description: 'Sends automated responses based on email content',
    lastRun: '2024-02-03',
    status: 'paused'
  }
];

export default function SavedAutomations() {
  const [automations] = useState(mockAutomations);

  const handleRunAutomation = (id: string) => {
    console.log('Running automation:', id);
    // Implement run logic
  };

  const handleEditAutomation = (id: string) => {
    console.log('Editing automation:', id);
    // Implement edit logic
  };

  const handleDeleteAutomation = (id: string) => {
    console.log('Deleting automation:', id);
    // Implement delete logic
  };

  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium text-[#1B1B1B]">Saved Automations</h1>
            <button className="bg-[#1B1B1B] text-white px-6 py-2.5 rounded-[14px] text-sm transition-colors hover:bg-[#2C2C2C]">
              Create New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-white/70 backdrop-blur-sm rounded-[20px] border border-black/5 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-[#1B1B1B] mb-1">{automation.name}</h3>
                    <p className="text-sm text-[#1B1B1B]/60">{automation.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    automation.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {automation.status}
                  </span>
                </div>
                
                <div className="text-sm text-[#1B1B1B]/60 mb-4">
                  Last run: {automation.lastRun}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunAutomation(automation.id)}
                    className="flex items-center justify-center flex-1 px-4 py-2 rounded-[14px] bg-[#1B1B1B] text-white text-sm hover:bg-[#2C2C2C] transition-colors"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Run
                  </button>
                  <button
                    onClick={() => handleEditAutomation(automation.id)}
                    className="flex items-center justify-center px-4 py-2 rounded-[14px] bg-black/5 text-[#1B1B1B] text-sm hover:bg-black/10 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                    className="flex items-center justify-center px-4 py-2 rounded-[14px] bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 