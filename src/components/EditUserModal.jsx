import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  LockClosedIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';
import { userService } from '../services/userService';
import { useNotification } from '../components/NotificationContext';

const EditUserModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    primaryPhone: '',
    secondaryPhone: '',
    category: '',
    username: '',
    password: '',
    address: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
    zipCode: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      setEditForm({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        primaryPhone: user.primaryPhone || '',
        secondaryPhone: user.secondaryPhone || '',
        category: user.category || 'customer',
        username: user.username || '',
        password: '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        countryCode: user.countryCode || '',
        zipCode: user.zipCode || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updates = {};
      
      // Only include changed fields
      Object.keys(editForm).forEach(key => {
        if (editForm[key] !== user[key] && editForm[key] !== '') {
          updates[key] = editForm[key];
        }
      });

      // Don't include empty password
      if (!editForm.password) {
        delete updates.password;
      }

      // Include category if it's changed
      if (editForm.category !== user.category) {
        updates.category = editForm.category;
      }

      await onUpdate(updates);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-3xl relative animate-fadeIn border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Edit User Profile
                </h2>
                <p className="text-gray-500 text-sm mt-1">Update user information</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px]" />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg"
                    placeholder="Email address"
                    required
                  />
                  <span className="text-red-500 text-xs absolute right-3 top-[15px]">*</span>
                </div>

                {editForm.category !== 'customer' && (
                  <div className="relative group">
                    <AtSymbolIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px]" />
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg"
                      placeholder="Username (letters, numbers, underscores only)"
                      required={editForm.category !== 'customer'}
                      pattern="^[a-zA-Z0-9_]{4,20}$"
                    />
                    <span className="text-red-500 text-xs absolute right-3 top-[15px]">*</span>
                    <div className="text-xs text-gray-500 mt-1 ml-1">
                      Username must be 4-20 characters, only letters, numbers, and underscores
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="relative group">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 
                      focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                    placeholder="Phone"
                  />
                </div>

                <div className="relative group">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editForm.password}
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    className="w-full pl-10 pr-24 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 
                      focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[6px] px-3 py-1.5 text-gray-500 hover:text-[#82a6f4] text-sm font-medium
                      bg-transparent rounded-md transition-all duration-200 hover:bg-transparent
                      focus:outline-none focus:ring-0 focus:border-transparent border-none"
                  >
                    {showPassword ? (
                      <div className="flex items-center gap-1.5">
                        <EyeSlashIcon className="h-4 w-4" />
                        <span>Hide</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <EyeIcon className="h-4 w-4" />
                        <span>Show</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="relative group">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 appearance-none
                      focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                  >
                    <option value="customer">Customer</option>
                    <option value="franchiser">Franchiser</option>
                    <option value="webmaster">Webmaster</option>
                    <option value="test">Test</option>
                  </select>
                  <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-[13px] pointer-events-none transition-colors duration-200 group-hover:text-[#82a6f4]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 bg-gradient-to-r from-[#82a6f4] to-[#a2c0ff] text-white font-medium rounded-lg
                  hover:from-[#6b8fd8] hover:to-[#8ba8e5] transform hover:-translate-y-0.5 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 active:scale-[0.98] shadow-lg hover:shadow-xl
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none
                  flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg 
                      className="animate-spin h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          </div>

          {/* Right Panel - Bento Grid */}
          <div className="hidden md:grid grid-cols-2 gap-3 content-start">
            <div className="bg-gradient-to-br from-[#82a6f4]/5 to-[#82a6f4]/10 rounded-lg p-6 aspect-square 
              flex items-center justify-center group hover:from-[#82a6f4]/10 hover:to-[#82a6f4]/20 transition-all duration-300">
              <UserIcon className="h-16 w-16 text-[#82a6f4]/40 group-hover:text-[#82a6f4]/60 transition-colors duration-300" />
            </div>
            <div className="bg-gradient-to-br from-[#82a6f4]/5 to-[#82a6f4]/10 rounded-lg p-6 hover:from-[#82a6f4]/10 hover:to-[#82a6f4]/20 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
              <p className="text-sm text-gray-500 mt-1">Update user information and access levels</p>
            </div>
            <div className="bg-gradient-to-br from-[#82a6f4]/5 to-[#82a6f4]/10 rounded-lg p-6 hover:from-[#82a6f4]/10 hover:to-[#82a6f4]/20 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800">Security</h3>
              <p className="text-sm text-gray-500 mt-1">Manage password and account settings</p>
            </div>
            <div className="bg-gradient-to-br from-[#82a6f4]/5 to-[#82a6f4]/10 rounded-lg p-6 
              flex flex-col items-center justify-center hover:from-[#82a6f4]/10 hover:to-[#82a6f4]/20 transition-all duration-300">
              <span className="text-[#82a6f4] font-medium">
                {user?.category.charAt(0).toUpperCase() + user?.category.slice(1)}
              </span>
              <p className="text-sm text-gray-500 mt-1">Account Type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
