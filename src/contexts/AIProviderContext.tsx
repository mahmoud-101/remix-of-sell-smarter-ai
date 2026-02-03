import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AIProvider = 'lovable' | 'openrouter';

interface AIProviderContextType {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

const AIProviderContext = createContext<AIProviderContextType | undefined>(undefined);

export function AIProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProviderState] = useState<AIProvider>(() => {
    const saved = localStorage.getItem('ai-provider');
    return (saved as AIProvider) || 'lovable';
  });

  const setProvider = (newProvider: AIProvider) => {
    setProviderState(newProvider);
    localStorage.setItem('ai-provider', newProvider);
  };

  useEffect(() => {
    const saved = localStorage.getItem('ai-provider');
    if (saved && (saved === 'lovable' || saved === 'openrouter')) {
      setProviderState(saved);
    }
  }, []);

  return (
    <AIProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </AIProviderContext.Provider>
  );
}

export function useAIProvider() {
  const context = useContext(AIProviderContext);
  if (!context) {
    throw new Error('useAIProvider must be used within an AIProviderProvider');
  }
  return context;
}
