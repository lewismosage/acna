// src/components/common/AlertModal.tsx
import { ReactNode } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <Check className="w-6 h-6 text-green-500" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />
  };

  const typeColorMap = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className={`px-6 py-4 flex items-center gap-3 ${typeColorMap[type]}`}>
          {iconMap[type]}
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-gray-700 mb-6">
            {message}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}