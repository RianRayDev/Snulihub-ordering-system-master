import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Notification = ({ message, type = 'info', onClose }) => {
  const notificationStyles = {
    success: {
      wrapper: 'bg-green-50 border-green-200',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      text: 'text-green-800',
      closeButton: 'text-green-500 hover:text-green-600'
    },
    error: {
      wrapper: 'bg-red-50 border-red-200',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      text: 'text-red-800',
      closeButton: 'text-red-500 hover:text-red-600'
    },
    warning: {
      wrapper: 'bg-yellow-50 border-yellow-200',
      icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
      text: 'text-yellow-800',
      closeButton: 'text-yellow-500 hover:text-yellow-600'
    },
    info: {
      wrapper: 'bg-blue-50 border-blue-200',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
      text: 'text-blue-800',
      closeButton: 'text-blue-500 hover:text-blue-600'
    }
  };

  const style = notificationStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${style.wrapper} max-w-md`}>
        {style.icon}
        <p className={`text-sm font-medium ${style.text} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`rounded-full p-1 transition-colors ${style.closeButton}`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
