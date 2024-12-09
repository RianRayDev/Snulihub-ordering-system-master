import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';
import { userService } from '../services/userService';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import app from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationContext';

const db = getFirestore(app);
const USERS_COLLECTION = 'users';

export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where("email", "==", formData.identifier),
        where("category", "==", "webmaster")
      );
      
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        throw new Error('Invalid admin credentials');
      }

      const userData = {
        id: userSnapshot.docs[0].id,
        ...userSnapshot.docs[0].data()
      };

      if (userData.password !== formData.password) {
        throw new Error('Invalid credentials');
      }

      sessionStorage.clear();
      sessionStorage.setItem('userRole', 'webmaster');
      sessionStorage.setItem('sessionEmail', userData.email);
      sessionStorage.setItem('userId', userData.id);
      sessionStorage.setItem('category', 'webmaster');
      
      await login(formData.identifier, formData.password);

      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        isOnline: true,
        lastActiveAt: serverTimestamp()
      });

      navigate('/admin/users');
    } catch (error) {
      setError(error.message);
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Panel - Branding & Info */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white">
          <div>
            <h1 className="text-3xl font-bold mb-4">SnuliHub Admin</h1>
            <p className="text-blue-100">Manage your store, users, and content all in one place.</p>
          </div>
          <div className="text-sm text-blue-100">© 2024 SnuliHub. All rights reserved.</div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200">
          <div className="max-w-md mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-gray-600">Please sign in to your admin account</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                      hover:border-gray-300 transition-all duration-200"
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                      hover:border-gray-300 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 
                      hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-xl
                  hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none
                  shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                  flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;