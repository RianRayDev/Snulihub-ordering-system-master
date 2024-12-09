import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const UserLogin = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Show message if redirected from admin login
    if (location.state?.message) {
      toast.info(location.state.message);
      // Clean up the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check user in database
      const usersRef = collection(db, USERS_COLLECTION);
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const userData = {
        id: userSnapshot.docs[0].id,
        ...userSnapshot.docs[0].data()
      };

      // If user is a webmaster, redirect to admin login
      if (userData.category === 'webmaster') {
        navigate('/admin/login', { 
          state: { 
            message: 'Please use the admin login page',
            email: email 
          } 
        });
        return;
      }

      // Attempt login for non-webmaster users
      const { login } = useAuth();
      const loggedInUser = await login(email, password);

      if (!loggedInUser) {
        throw new Error('Invalid credentials');
      }

      // Store user session
      localStorage.setItem('sessionEmail', userData.email);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userRole', userData.category);

      // Redirect based on user category
      if (userData.category === 'customer') {
        navigate('/customer-dashboard');
      } else if (userData.category === 'franchise') {
        navigate('/franchise-dashboard');
      }

      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-[#82a6f4] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-[#82a6f4] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#82a6f4] hover:bg-[#6b8fd8] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign In
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
