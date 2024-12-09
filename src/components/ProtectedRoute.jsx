import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Check authentication
      if (!currentUser) {
        navigate('/admin/login', { replace: true });
        setIsAuthorized(false);
        return;
      }

      // Check authorization
      if (requiredRole && currentUser.category !== requiredRole) {
        navigate('/admin/users', { 
          state: { message: 'Access denied: Insufficient permissions' }
        });
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    }
  }, [currentUser, loading, navigate, requiredRole]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? children : null;
};

export default ProtectedRoute;
