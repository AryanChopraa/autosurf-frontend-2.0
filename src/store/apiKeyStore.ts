import { create } from 'zustand'

export type ApiKeyProvider = 'claude' | 'gemini' | 'openai' | 'deepseek';

export interface ApiKey {
  provider: ApiKeyProvider;
  key: string;
}

interface ApiKeyStore {
  apiKeys: ApiKey[];
  setApiKeys: (apiKeys: ApiKey[]) => void;
  addApiKey: (apiKey: ApiKey) => void;
  updateApiKey: (provider: ApiKeyProvider, key: string) => void;
  deleteApiKey: (provider: ApiKeyProvider) => void;
}

export const useApiKeyStore = create<ApiKeyStore>()((set) => ({
  apiKeys: [],
  setApiKeys: (apiKeys) => set({ apiKeys }),
  addApiKey: (apiKey) => set((state) => ({ 
    apiKeys: [...state.apiKeys, apiKey] 
  })),
  updateApiKey: (provider, key) => set((state) => ({
    apiKeys: state.apiKeys.map((apiKey) =>
      apiKey.provider === provider ? { ...apiKey, key } : apiKey
    ),
  })),
  deleteApiKey: (provider) => set((state) => ({
    apiKeys: state.apiKeys.filter((apiKey) => apiKey.provider !== provider),
  })),
})); 