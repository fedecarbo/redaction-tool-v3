import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import * as RadixToast from '@radix-ui/react-toast';

interface ConfirmationToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const ConfirmationToast: React.FC<ConfirmationToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  const [open, setOpen] = useState(isVisible);
  useEffect(() => {
    setOpen(isVisible);
  }, [isVisible]);
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const Icon = type === 'success' ? CheckCircle : XCircle;
  return (
    <RadixToast.Provider swipeDirection="right">
      <RadixToast.Root open={open} onOpenChange={setOpen} duration={duration} className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in-right ${bgColor} ${textColor}`}>
        <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg w-full`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <RadixToast.Title className="text-sm font-medium flex-1">{message}</RadixToast.Title>
          <RadixToast.Action asChild altText="Close">
            <button onClick={() => { setOpen(false); onClose(); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </RadixToast.Action>
        </div>
      </RadixToast.Root>
      <RadixToast.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-full outline-none" />
    </RadixToast.Provider>
  );
}; 