import { FC } from 'react';

const BrowserAgentPage: FC = () => {
  return (
    <div className="ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Browser Agent</h1>
        
        {/* Task Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              id="task"
              rows={6}
              className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what you want the browser agent to do..."
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Task
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Clear
            </button>
          </div>
        </div>

        {/* Task Status */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Task Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Agent is ready</span>
            </div>
            <div className="border-l-2 border-gray-200 pl-4 ml-1 space-y-2">
              <p className="text-gray-600">No active task running</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserAgentPage; 