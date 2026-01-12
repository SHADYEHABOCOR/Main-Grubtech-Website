import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AdminContext.Provider value={{ isDarkMode, toggleDarkMode, showToast }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white animate-fade-in`}>
            {toast.message}
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
};
