import { FC } from 'react';

const TaskHistoryPage: FC = () => {
  // Dummy data for demonstration
  const tasks = [
    {
      id: 1,
      description: 'Search for best restaurants in New York',
      status: 'completed',
      timestamp: '2024-03-10T14:30:00Z',
      duration: '2m 15s'
    },
    {
      id: 2,
      description: 'Find latest tech news about AI',
      status: 'completed',
      timestamp: '2024-03-10T12:15:00Z',
      duration: '1m 45s'
    },
    {
      id: 3,
      description: 'Research electric car prices',
      status: 'failed',
      timestamp: '2024-03-09T18:20:00Z',
      duration: '0m 30s'
    }
  ];

  return (
    <div className="ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Task History</h1>
          <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Clear History
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{task.description}</h3>
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Duration: {task.duration}</span>
                <span>•</span>
                <span>{new Date(task.timestamp).toLocaleString()}</span>
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskHistoryPage; 