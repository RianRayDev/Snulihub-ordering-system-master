import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';

const CreateUserModal = ({ isOpen, onClose, onCreateUser, userType }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    primaryPhone: '',
    secondaryPhone: '',
    category: userType,
    password: '',
    username: '',
    address: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
    zipCode: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    message: '',
    sellerMessage: '',
    isActive: true,
    isOnline: false,
    permissions: false,
    schemaVersion: 1
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: userType
    }));
  }, [userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.email || !formData.firstName || !formData.lastName) {
        throw new Error('Please fill in all required fields');
      }

      // Validate username for non-customer users
      if (formData.category !== 'customer' && !formData.username) {
        throw new Error('Username is required for non-customer users');
      }

      // Ensure category is set from userType before submission
      const submitData = {
        ...formData,
        category: userType
      };

      await onCreateUser(submitData);
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      // Add error handling UI here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-lg relative animate-fadeIn border border-white/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Add New {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Enter user details below</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative group">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                  focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                placeholder="Email address"
              />
            </div>

            {/* Username */}
            {formData.category !== 'customer' && (
              <div className="relative group">
                <AtSymbolIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                    focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                  placeholder="Username (letters, numbers, underscores only)"
                  pattern="^[a-zA-Z0-9_]{4,20}$"
                />
                <span className="text-red-500 text-xs absolute right-3 top-[15px]">*</span>
                <div className="text-xs text-gray-500 mt-1 ml-1">
                  Username must be 4-20 characters, only letters, numbers, and underscores
                </div>
              </div>
            )}

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                    focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                  placeholder="First name"
                />
              </div>
              <div className="relative group">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                    focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative group">
              <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                  focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                placeholder="Phone number (optional)"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[13px] transition-colors duration-200 group-hover:text-[#82a6f4]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-800 
                  focus:outline-none focus:ring-1 focus:ring-[#82a6f4] focus:border-[#82a6f4] hover:border-[#82a6f4]/50 transition-all duration-200"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[13px] text-gray-400 hover:text-[#82a6f4] transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-[#82a6f4] to-[#a2c0ff] text-white font-medium rounded-lg
                hover:from-[#6b8fd8] hover:to-[#8ba8e5] transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/50 active:scale-[0.98]
                disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating User...</span>
                </>
              ) : (
                'Create User'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
