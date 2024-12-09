import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../components/NotificationContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';

const UserLogin = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (location.state?.message) {
      showNotification(location.state.message, 'info');
      window.history.replaceState({}, document.title);
    }
  }, [location, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      sessionStorage.clear();
      
      // First verify user exists and get their data
      const usersRef = collection(db, 'users');
      const emailQuery = query(
        usersRef,
        where("email", "==", formData.email)
      );
      
      const userSnapshot = await getDocs(emailQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found in database');
      }

      const userData = {
        id: userSnapshot.docs[0].id,
        ...userSnapshot.docs[0].data()
      };

      // Check if user is webmaster
      if (userData.category === 'webmaster') {
        navigate('/admin/login', { 
          state: { message: 'Please use the admin login page' }
        });
        return;
      }

      // Verify user category
      if (!['customer', 'franchise', 'test'].includes(userData.category)) {
        throw new Error('Invalid user category');
      }

      // Verify password
      if (userData.password !== formData.password) {
        throw new Error('Invalid credentials');
      }

      // Authenticate with AuthContext
      await login(formData.email, formData.password);

      // Set session data
      sessionStorage.setItem('userRole', userData.category);
      sessionStorage.setItem('sessionEmail', userData.email);
      sessionStorage.setItem('userId', userData.id);
      sessionStorage.setItem('category', userData.category);
      sessionStorage.setItem('isFranchise', userData.category === 'franchise' ? 'true' : 'false');
      sessionStorage.setItem('isCustomer', userData.category === 'customer' ? 'true' : 'false');
      sessionStorage.setItem('isTest', userData.category === 'test' ? 'true' : 'false');

      // Update online status
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        isOnline: true,
        lastActiveAt: serverTimestamp()
      });

      // Navigate based on category
      switch (userData.category) {
        case 'customer':
          navigate('/customer/dashboard');
          break;
        case 'franchise':
          navigate('/franchise/dashboard');
          break;
        case 'test':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/');
      }

      showNotification('Login successful!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      showNotification(error.message, 'error');
      sessionStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel - Login Form */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome Back
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-[#82a6f4] absolute left-3 top-3" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 
                  focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-[#82a6f4] absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-800 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 
                  focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                  hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#82a6f4] hover:bg-[#6b8fd8] text-white font-medium 
                rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 
                disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Right Panel - Bento Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#82a6f4]/10 rounded-3xl p-6 aspect-square">
            <img
              src="/path-to-your-image1.jpg"
              alt="Feature 1"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="bg-[#82a6f4]/20 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Track Orders
            </h3>
            <p className="text-gray-600">
              Monitor your orders and shipping status in real-time
            </p>
          </div>
          <div className="bg-[#82a6f4]/15 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Manage Profile
            </h3>
            <p className="text-gray-600">
              Update your information and preferences
            </p>
          </div>
          <div className="bg-[#82a6f4]/5 rounded-3xl p-6">
            <img
              src="/path-to-your-image2.jpg"
              alt="Feature 2"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
