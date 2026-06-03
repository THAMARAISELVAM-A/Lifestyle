import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, title, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 3.5 seconds (allowing for 500ms slide-out animation transition)
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return {
    toasts,
    addToast,
    removeToast
  };
};
