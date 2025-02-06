import axios from 'axios';
import type { AxiosError } from 'axios';
import { ApiKey, ApiKeyProvider } from '../store/apiKeyStore';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get auth token for requests
const getAuthHeader = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch (error) {
    console.error('Error getting auth session:', error);
    return {};
  }
};

// Error handler helper
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message: string }>;
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    } else if (axiosError.response?.status === 400) {
      throw new Error('API key is required');
    } else if (axiosError.response?.status === 401) {
      throw new Error('Unauthorized access. Please sign in again.');
    } else if (axiosError.response?.status === 403) {
      throw new Error('Access forbidden. You do not have permission to perform this action.');
    }
  }
  throw new Error('An unexpected error occurred. Please try again later.');
};

/**
 * Fetches all API keys for the current user
 */
export async function getUserApiKeys(): Promise<ApiKey[]> {
  try {
    const headers = await getAuthHeader();
    const response = await apiClient.get<ApiKey[]>('/users/api-keys', { headers });
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 404 || 
          axiosError.response?.data?.message === 'No API key found') {
        return [];
      }
    }
    // handleApiError(error);
    return [];
  }
}

/**
 * Adds a new API key for the current user
 */
export async function addApiKey(apiKey: ApiKey): Promise<ApiKey> {
  try {
    const headers = await getAuthHeader();
    const response = await apiClient.post<ApiKey>('/users/api-keys', apiKey, { headers });
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
}

/**
 * Updates an existing API key
 */
export async function updateApiKey(apiKey: ApiKey): Promise<ApiKey> {
  try {
    const headers = await getAuthHeader();
    const response = await apiClient.put<ApiKey>(
      `/users/api-keys/${apiKey.provider}`,
      apiKey,
      { headers }
    );
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
}

/**
 * Deletes an API key by provider
 */
export async function deleteApiKey(provider: ApiKeyProvider): Promise<void> {
  try {
    const headers = await getAuthHeader();
    await apiClient.delete(`/users/api-keys/${provider}`, { headers });
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
}

interface BrowserSessionResponse {
  status: string;
  data: {
    id: string;
  };
}

export async function startBrowserSession(runObjective: string): Promise<BrowserSessionResponse> {
  try {
    const headers = await getAuthHeader();
    const response = await apiClient.post<BrowserSessionResponse>(`/agent/create-run`, { runObjective }, { headers });
    console.log("response", response.data);
    return response.data;
  } catch (error: any) {
    console.log("error", error);
    // handleApiError(error);
    throw error.response.data.message;
  }
}


interface Step {
  number: number;
  action: string;
  explanation: string;
}

interface AgentRunSteps {
  steps: Step[];
  finalAnswer: string;
}

export interface AgentRun {
    id: string;
    user_id: string;
    run_objective: string;
    started_at: string;
    completed_at: string | null;
    status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
    steps: AgentRunSteps | null;
}

interface AgentRunsResponse {
  status: string;
  results: number;
  data: {
    agentRuns: AgentRun[];
  };
}

export const getAllRuns = async (): Promise<AgentRunsResponse> => {
  try {
    const headers = await getAuthHeader();
    const response = await apiClient.get<AgentRunsResponse>(`/agent/all-runs`, { headers });
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    // handleApiError(error);
    throw error;
  }
}

export const apiService = {
  getUserApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey,
}; 