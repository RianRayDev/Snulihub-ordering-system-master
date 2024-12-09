import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app);

const StatusIndicator = ({ isOnline, lastActiveAt, userId }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [status, setStatus] = useState({ 
    isOnline: isOnline || false, 
    lastActiveAt: lastActiveAt || null 
  });

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setStatus({
          isOnline: Boolean(userData.isOnline),
          lastActiveAt: userData.lastActiveAt || null
        });
      }
    }, (error) => {
      console.error("Error getting real-time updates:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  const getStatusText = () => {
    if (status.isOnline) {
      return 'Currently Active';
    }
    if (status.lastActiveAt) {
      const lastActive = status.lastActiveAt.toDate();
      const timeDiff = Date.now() - lastActive.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `Last active ${days} days ago`;
      if (hours > 0) return `Last active ${hours} hours ago`;
      if (minutes > 0) return `Last active ${minutes} minutes ago`;
      return 'Last active just now';
    }
    return 'Never active';
  };

  return (
    <div className="relative">
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full cursor-help
          ${status.isOnline 
            ? 'bg-gradient-to-r from-green-400 to-green-500 ring-4 ring-white' 
            : 'bg-gradient-to-r from-gray-300 to-gray-400 ring-4 ring-white'
          } transition-all duration-300 shadow-sm`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      
      {showTooltip && (
        <div className="absolute z-50 left-5 bottom-0 px-3 py-2 bg-white text-gray-700 text-xs rounded-lg whitespace-nowrap shadow-xl border border-gray-100 transform -translate-y-1/2">
          <div className="font-medium">
            {status.isOnline ? (
              <span className="text-green-500">Currently Active</span>
            ) : (
              <span className="text-gray-600">{getStatusText()}</span>
            )}
          </div>
          {status.lastActiveAt && !status.isOnline && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              {status.lastActiveAt.toDate().toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
