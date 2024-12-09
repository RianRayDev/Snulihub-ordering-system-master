import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (type, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <div className="fixed top-4 right-4 z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`mb-2 p-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
