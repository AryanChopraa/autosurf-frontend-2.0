'use client';

import BackgroundTexture from '@/components/BackgroundTexture';

export default function DashboardPage() {
  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-[#1B1B1B]">Welcome back, Aryan Chopra</h1>
            <p className="text-[#1B1B1B]/60 mt-1">Create and manage your browser automation tasks</p>
          </div>

          {/* New Browser Task Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-[20px] border border-black/5 p-6 shadow-sm mb-8">
            <h2 className="text-lg font-medium text-[#1B1B1B] mb-4">New Browser Task</h2>
            <textarea
              placeholder="Describe what you want the browser to do..."
              className="w-full h-32 p-4 rounded-[14px] border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
            />
            <button className="mt-4 bg-[#1B1B1B] text-white px-6 py-2.5 rounded-[14px] text-sm transition-colors hover:bg-[#2C2C2C]">
              Execute Task
            </button>
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-[20px] border border-black/5 p-6 text-left hover:shadow-md transition-shadow group"
              >
                <h3 className="font-medium text-[#1B1B1B] mb-2 group-hover:text-[#2C2C2C]">{action.title}</h3>
                <p className="text-sm text-[#1B1B1B]/60">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const quickActions = [
  {
    title: 'Data Scraping',
    description: 'Extract data from websites automatically'
  },
  {
    title: 'Form Automation',
    description: 'Automate form filling and submissions'
  },
  {
    title: 'Web Testing',
    description: 'Test web applications and workflows'
  }
]; 