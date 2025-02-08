'use client';

import { useState, useEffect } from 'react';
import { PlayIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import BackgroundTexture from '@/components/BackgroundTexture';
import { apiService } from '@/services/api';
import { Automation } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface EditingState {
  id: string | null;
  automation_name: string;
  objective: string;
}

export default function SavedAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState>({
    id: null,
    automation_name: '',
    objective: ''
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const router = useRouter();

  const fetchAutomations = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllAutomations();
      setAutomations(response.data.automations);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch automations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleRunAutomation = (id: string) => {
    console.log('Running automation:', id);
    // Implement run logic
    router.push(`/saved-automations/${id}`);
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingState({
      id: automation.id,
      automation_name: automation.automation_name,
      objective: automation.objective
    });
  };

  const handleCancelEdit = () => {
    setEditingState({
      id: null,
      automation_name: '',
      objective: ''
    });
  };

  const handleSaveEdit = async (automation: Automation) => {
    if (!editingState.automation_name.trim() || !editingState.objective.trim()) {
      toast.error('Name and objective are required');
      return;
    }

    const toastId = toast.loading('Updating automation...');
    try {
      setIsUpdating(automation.id);
      const updatedAutomation = {
        ...automation,
        automation_name: editingState.automation_name.trim(),
        objective: editingState.objective.trim()
      };
      await apiService.updateAutomation(updatedAutomation);
      toast.success('Automation updated successfully', { id: toastId });
      await fetchAutomations();
      handleCancelEdit();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update automation';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation(id);
  };

  const handleDeleteConfirm = async (id: string) => {
    const toastId = toast.loading('Deleting automation...');
    try {
      setIsDeleting(id);
      await apiService.deleteAutomation(id);
      toast.success('Automation deleted successfully', { id: toastId });
      await fetchAutomations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete automation';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDeleting(null);
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B1B1B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <BackgroundTexture />
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium text-[#1B1B1B]">Saved Automations</h1>
            <button 
              onClick={() => router.push('/browser')}
              className="bg-[#1B1B1B] text-white px-6 py-2.5 rounded-[14px] text-sm transition-colors hover:bg-[#2C2C2C]"
            >
              Create New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-white/70 backdrop-blur-sm rounded-[20px] border border-black/5 p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {deleteConfirmation === automation.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[20px] p-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-center text-[#1B1B1B] font-medium">Are you sure you want to delete this automation?</p>
                    <p className="text-sm text-[#1B1B1B]/60 text-center">{automation.automation_name}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeleteConfirm(automation.id)}
                        disabled={isDeleting === automation.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-[14px] text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isDeleting === automation.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                        ) : (
                          'Delete'
                        )}
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-[14px] text-sm hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="w-full">
                    {editingState.id === automation.id ? (
                      <div className="space-y-3 w-full">
                        <input
                          type="text"
                          value={editingState.automation_name}
                          onChange={(e) => setEditingState(prev => ({ ...prev, automation_name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#1B1B1B] bg-white"
                          placeholder="Automation Name"
                        />
                        <textarea
                          value={editingState.objective}
                          onChange={(e) => setEditingState(prev => ({ ...prev, objective: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#1B1B1B] bg-white resize-none"
                          placeholder="Objective"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-[#1B1B1B] mb-1">{automation.automation_name}</h3>
                        <p className="text-sm text-[#1B1B1B]/60">{automation.objective}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-[#1B1B1B]/60 mb-4">
                  Created: {new Date(automation.created_at).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  {editingState.id === automation.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(automation)}
                        disabled={isUpdating === automation.id}
                        className="flex items-center justify-center flex-1 px-4 py-2 rounded-[14px] bg-green-600 text-white text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isUpdating === automation.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center px-4 py-2 rounded-[14px] bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRunAutomation(automation.id)}
                        className="flex items-center justify-center flex-1 px-4 py-2 rounded-[14px] bg-[#1B1B1B] text-white text-sm hover:bg-[#2C2C2C] transition-colors"
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Run
                      </button>
                      <button
                        onClick={() => handleEditAutomation(automation)}
                        className="flex items-center justify-center px-4 py-2 rounded-[14px] bg-black/5 text-[#1B1B1B] text-sm hover:bg-black/10 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(automation.id)}
                        className="flex items-center justify-center px-4 py-2 rounded-[14px] bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 