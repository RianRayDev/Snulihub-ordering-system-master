import React, { useState, useEffect, useMemo } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import app from '../firebaseConfig';
import { userService } from '../services/userService';
import CreateProductModal from '../components/CreateProductModal';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationContext';
import EditUserModal from '../components/EditUserModal';
import { 
  UserIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import CreateUserModal from '../components/CreateUserModal';
import { useAuth } from '../context/AuthContext';
import StatusIndicator from '../components/StatusIndicator';

const db = getFirestore(app);

const ProfileIcon = () => (
  <svg
    className="h-11 w-11"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Circle with Gradient */}
    <circle 
      cx="20" 
      cy="20" 
      r="20" 
      className="fill-[url(#gradient-bg)]"
    />
    
    {/* Profile Shape with Soft Shadows */}
    <g filter="url(#shadow)">
      <circle 
        cx="20" 
        cy="15" 
        r="6.5" 
        className="fill-[url(#gradient-profile)]"
      />
      <path
        d="M32 31.5C32 27.4 26.6274 24.5 20 24.5C13.3726 24.5 8 27.4 8 31.5"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-[#82a6f4]"
        style={{ opacity: 0.9 }}
      />
    </g>

    {/* Gradient Definitions */}
    <defs>
      <linearGradient
        id="gradient-bg-user"
        x1="0"
        y1="0"
        x2="40"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#82a6f4" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#82a6f4" stopOpacity="0.12" />
      </linearGradient>
      
      <linearGradient
        id="gradient-profile-user"
        x1="15"
        y1="10"
        x2="25"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#82a6f4" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#82a6f4" stopOpacity="0.8" />
      </linearGradient>

      {/* Soft Shadow Effect */}
      <filter
        id="shadow-user"
        x="-2"
        y="-2"
        width="44"
        height="44"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="1" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.509804 0 0 0 0 0.65098 0 0 0 0 0.956863 0 0 0 0.15 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_0_1"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_0_1"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

const UserConsole = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    category: 'customer',
    password: '',
    username: ''
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserDropdown, setShowAddUserDropdown] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [updatingUsers, setUpdatingUsers] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCategory, setUserCategory] = useState('');
  const [isTestAdmin, setIsTestAdmin] = useState(false);
  const { currentUser } = useAuth();
  const [usersNeedingUpdate, setUsersNeedingUpdate] = useState(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const userRole = sessionStorage.getItem('userRole');
      
      if (!currentUser || !userRole) {
        navigate('/admin/login', { replace: true });
        return;
      }
      
      if (userRole !== 'webmaster') {
        navigate('/login', { 
          state: { message: 'Access denied: Not an admin account' }
        });
        return;
      }

      fetchUsers();
    };

    checkAuth();
  }, [currentUser, navigate]);

  useEffect(() => {
    const checkUsersSchema = () => {
      const needsUpdate = new Set();
      
      users.forEach(user => {
        if (!user.userId || 
            user.permissions === undefined || 
            !user.schemaVersion || 
            user.schemaVersion < 1) {
          needsUpdate.add(user.id);
        }
      });

      setUsersNeedingUpdate(needsUpdate);
    };

    checkUsersSchema();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (err) {
      setError('Error fetching users: ' + err.message);
      showNotification('error', 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (currentUser.category !== 'webmaster') {
    navigate('/login', { 
      state: { message: 'Access denied: Not an admin account' }
    });
    return null;
  }

  // Create new user
  const handleCreateUser = async (userData) => {
    setIsCreatingUser(true);
    try {
      // Generate proper user ID based on category
      const userId = generateUserId(userData.category, users);
      
      // Prepare base user data
      const baseUserData = {
        id: userId,
        userId: userId,
        isActive: true,
        isOnline: false,
        lastActiveAt: null,
        lastLoginAt: null,
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Category-specific configurations
      const categoryConfigs = {
        webmaster: {
          permissions: true,
          username: userData.username,
          requiresUsername: true
        },
        franchise: {
          permissions: false,
          username: userData.username,
          requiresUsername: true
        },
        customer: {
          permissions: false,
          username: null,
          requiresUsername: false
        },
        test: {
          permissions: false,
          username: userData.username,
          requiresUsername: true
        }
      };

      const categoryConfig = categoryConfigs[userData.category];
      
      // Validate username if required
      if (categoryConfig.requiresUsername && !userData.username) {
        throw new Error(`Username is required for ${userData.category} accounts`);
      }

      if (categoryConfig.requiresUsername && userData.username) {
        const existingUser = await userService.getUserByUsername(userData.username);
        if (existingUser) {
          throw new Error('Username already exists');
        }
      }

      // Combine all data
      const newUserData = {
        ...baseUserData,
        ...userData,
        ...categoryConfig
      };

      // Create user
      const success = await userService.createUser(newUserData);
      
      if (success) {
        showNotification(`${userData.category} user created successfully!`, 'success');
        setIsAddUserModalOpen(false);
        await fetchUsers();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Update user
  const handleUpdateUser = async (updates) => {
    try {
      if (!editingUser) return;

      // Special handling for category changes
      if (updates.category && updates.category !== editingUser.category) {
        // Generate new userId based on new category
        const newUserId = generateUserId(updates.category, users);
        
        // Delete old document first
        const oldUserRef = doc(db, 'users', editingUser.id);
        await deleteDoc(oldUserRef);

        // Prepare update data based on target category
        const updateData = {
          ...editingUser,
          ...updates,
          id: newUserId,
          userId: newUserId,
          updatedAt: new Date(),
          schemaVersion: 1
        };

        // Category-specific adjustments
        switch(updates.category) {
          case 'customer':
            updateData.username = null;
            updateData.permissions = false;
            break;
          case 'franchise':
            updateData.username = `fr_${editingUser.firstName.toLowerCase()}`;
            updateData.permissions = false;
            break;
          case 'webmaster':
            updateData.username = `web_${editingUser.firstName.toLowerCase()}`;
            updateData.permissions = true;
            break;
          case 'test':
            updateData.username = `te_${editingUser.firstName.toLowerCase()}`;
            updateData.permissions = false;
            break;
        }

        // Create new document with new ID
        const newUserRef = doc(db, 'users', newUserId);
        await setDoc(newUserRef, updateData);

        showNotification(`User updated to ${updates.category} successfully`, 'success');
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
        return;
      }

      // Handle other updates
      const updateData = {
        ...editingUser,
        ...updates,
        updatedAt: new Date(),
        schemaVersion: 1
      };

      await userService.updateUser(editingUser.id, updateData);
      showNotification('User updated successfully', 'success');
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        fetchUsers();
      } catch (err) {
        setError('Error deleting user: ' + err.message);
      }
    }
  };

  // Upgrade user to franchise
  const handleUpgradeToFranchise = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Generate new franchise ID
      const newUserId = generateUserId('franchise', users);

      // Delete old document first
      const oldUserRef = doc(db, 'users', userId);
      await deleteDoc(oldUserRef);

      // Create new document with franchise data
      const updateData = {
        ...user,
        id: newUserId,
        userId: newUserId,
        category: 'franchise',
        permissions: false,
        updatedAt: new Date()
      };

      // Create new document with new ID
      const newUserRef = doc(db, 'users', newUserId);
      await setDoc(newUserRef, updateData);

      showNotification('User upgraded to franchise successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // Revert franchise to customer
  const handleRevertToCustomer = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Generate new customer ID
      const newUserId = generateUserId('customer', users);

      // Delete old document first
      const oldUserRef = doc(db, 'users', userId);
      await deleteDoc(oldUserRef);

      // Create new document with customer data
      const updateData = {
        ...user,
        id: newUserId,
        userId: newUserId,
        category: 'customer',
        permissions: false,
        updatedAt: new Date()
      };

      // Create new document with new ID
      const newUserRef = doc(db, 'users', newUserId);
      await setDoc(newUserRef, updateData);

      showNotification('User reverted to customer successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  // Handle product creation success
  const handleProductCreated = (newProduct) => {
    // You can add additional logic here if needed
    setIsProductModalOpen(false);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      showNotification('User status updated successfully!', 'success');
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      searchQuery === '' ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower);

    // Category filter
    const matchesCategory = 
      filters.category === 'all' || 
      user.category === filters.category;

    // Status filter
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'active' ? user.isActive : !user.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const needsSchemaUpdate = (user) => {
    // First check if user is corrupted
    if (user.firstName === undefined && user.lastName === undefined) {
      return true;
    }
    // Define required fields for each category
    const requiredFields = {
      customer: [
        'id', 'userId', 'email', 'firstName', 'lastName', 'password',
        'category', 'isActive', 'isOnline', 'permissions', 'schemaVersion',
        'createdAt', 'updatedAt', 'lastActiveAt', 'lastLoginAt',
        'address', 'city', 'state', 'country', 'countryCode', 'zipCode',
        'phone', 'primaryPhone', 'secondaryPhone', 'cardNumber', 'cvv',
        'expiryDate', 'message', 'sellerMessage'
      ],
      franchiser: [
        'id', 'userId', 'email', 'firstName', 'lastName', 'password',
        'username', 'category', 'isActive', 'isOnline', 'permissions',
        'schemaVersion', 'createdAt', 'updatedAt', 'lastActiveAt',
        'lastLoginAt', 'address', 'city', 'state', 'country',
        'countryCode', 'zipCode', 'phone', 'primaryPhone', 'secondaryPhone'
      ],
      test: [
        'id', 'userId', 'email', 'firstName', 'lastName', 'password',
        'category', 'isActive', 'isOnline', 'permissions', 'schemaVersion',
        'createdAt', 'updatedAt', 'lastActiveAt', 'lastLoginAt'
      ]
    };

    // Check if user has all required fields for their category
    const categoryFields = requiredFields[user.category] || [];
    const missingFields = categoryFields.filter(field => 
      !user.hasOwnProperty(field) || user[field] === undefined
    );

    return missingFields.length > 0 || !user.schemaVersion || user.schemaVersion < 1;
  };

  // Add this function to handle corrupted users
  const handleRemoveCorruptedUser = async (user) => {
    try {
      // Check if this is a corrupted user (undefined fields)
      if (user.firstName === undefined && user.lastName === undefined) {
        const userRef = doc(db, 'users', user.id);
        await deleteDoc(userRef);
        showNotification('Corrupted user record removed successfully', 'success');
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      showNotification('Error removing corrupted user: ' + error.message, 'error');
    }
  };

  // Update the update handler
  const handleSchemaUpdate = async (user) => {
    setUpdatingUsers(prev => ({ ...prev, [user.id]: true }));
    try {
      // Check if user is corrupted
      if (user.firstName === undefined && user.lastName === undefined) {
        await handleRemoveCorruptedUser(user);
        return;
      }
      // Prepare default values based on category
      const defaultValues = {
        customer: {
          cardNumber: '',
          cvv: '',
          expiryDate: '',
          message: '',
          sellerMessage: '',
          phone: '',
          primaryPhone: '',
          secondaryPhone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          countryCode: '',
          zipCode: ''
        },
        franchiser: {
          phone: '',
          primaryPhone: '',
          secondaryPhone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          countryCode: '',
          zipCode: '',
          username: user.username || ''
        },
        test: {
          cardNumber: '',
          cvv: '',
          expiryDate: '',
          message: '',
          sellerMessage: '',
          phone: '',
          primaryPhone: '',
          secondaryPhone: '',
          address: '',
          city: '',
          state: '',
          country: '',
          countryCode: '',
          zipCode: ''
        }
      };

      const updateData = {
        ...user,
        userId: user.id,
        isActive: user.isActive ?? true,
        isOnline: user.isOnline ?? false,
        permissions: user.category === 'webmaster',
        schemaVersion: 1,
        lastActiveAt: user.lastActiveAt ?? null,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt || new Date(),
        updatedAt: new Date(),
        ...defaultValues[user.category]
      };

      await userService.updateUserAttributes(user.id, updateData);
      showNotification('User schema updated successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setUpdatingUsers(prev => ({ ...prev, [user.id]: false }));
    }
  };

  // Add this helper function
  const generateUserId = (category, users) => {
    const prefixMap = {
      'webmaster': 'web',
      'franchise': 'fr',
      'customer': 'cu',
      'test': 'te'
    };
    
    const prefix = prefixMap[category];
    const existingIds = users
      .filter(user => user.id.startsWith(prefix))
      .map(user => parseInt(user.id.slice(prefix.length)));
    
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(6, '0')}`;
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header without Logout */}

      {/* Users List */}
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Users Management
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="inline-flex items-center px-4 py-2.5 bg-white rounded-xl text-sm font-medium text-gray-700
                  hover:bg-gray-50 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
              >
                <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
                Filters
                {(filters.category !== 'all' || filters.status !== 'all') && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#82a6f4] text-white">
                    {(filters.category !== 'all' && filters.status !== 'all') ? '2' : '1'}
                  </span>
                )}
              </button>

              {filterMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 p-4 animate-fadeIn">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'customer', 'franchise', 'webmaster', 'test'].map((category) => (
                          <button
                            key={category}
                            onClick={() => setFilters(prev => ({ ...prev, category }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 
                              ${filters.category === category 
                                ? 'bg-[#82a6f4] text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <div className="flex gap-2">
                        {['all', 'active', 'inactive'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setFilters(prev => ({ ...prev, status }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                              ${filters.status === status 
                                ? 'bg-[#82a6f4] text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Filters */}
                    {(filters.category !== 'all' || filters.status !== 'all') && (
                      <button
                        onClick={() => {
                          setFilters({ category: 'all', status: 'all' });
                          setFilterMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 
                          font-medium transition-colors duration-200"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm 
                  focus:outline-none focus:ring-2 focus:ring-[#82a6f4]/20 focus:border-[#82a6f4] w-64
                  shadow-sm transition-all duration-200"
              />
            </div>

            {/* Add User Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddUserDropdown(!showAddUserDropdown)}
                onBlur={() => setTimeout(() => setShowAddUserDropdown(false), 200)}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#6dc2ff] to-[#92d3ff] text-white text-sm font-medium rounded-lg
                  hover:from-[#5ab1ef] hover:to-[#7fc4f0] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5 mr-1.5" />
                Add User
              </button>

              {showAddUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {['customer', 'franchise', 'webmaster', 'test'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedUserType(type);
                        setIsAddUserModalOpen(true);
                        setShowAddUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#6dc2ff]/10 hover:text-[#6dc2ff] 
                        flex items-center gap-2 transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4" />
                      Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#6dc2ff] to-[#92d3ff] text-white text-sm font-medium rounded-lg
                hover:from-[#5ab1ef] hover:to-[#7fc4f0] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-1.5" />
              Add Product
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                  Contact
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center gap-4">
                      <div className="relative group transform transition-transform duration-200 hover:scale-105">
                        <ProfileIcon />
                        <StatusIndicator 
                          isOnline={user.isOnline}
                          lastActiveAt={user.lastActiveAt}
                          userId={user.id}
                        />
                      </div>
                      <div className="flex flex-col">
                        {/* Name */}
                        <div className="font-semibold text-gray-800">
                          {user.firstName} {user.lastName}
                        </div>
                        
                        {/* Email */}
                        <div className="text-sm text-[#6B7280] hover:text-[#4B5563] transition-colors duration-200">
                          {user.email}
                        </div>
                        
                        {/* ID */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-medium text-[#9CA3AF]">ID:</span>
                          <span className="text-xs text-[#6B7280]">{user.userId}</span>
                        </div>
                        
                        {/* Username - Only show for non-customer accounts */}
                        {user.username && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs font-medium text-[#9CA3AF]">Username:</span>
                            <span className="text-xs text-[#6B7280]">{user.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <div className="text-sm text-gray-900">{user.phone || 'No phone'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.category === 'franchise' ? 'bg-purple-100 text-purple-800' :
                          user.category === 'webmaster' ? 'bg-red-100 text-red-800' :
                          user.category === 'test' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                          ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}
                          hover:bg-opacity-80 transition-colors duration-200 cursor-pointer`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {/* Update button - only shows if schema update is needed */}
                      {needsSchemaUpdate(user) && (
                        <button
                          onClick={() => handleSchemaUpdate(user)}
                          disabled={updatingUsers[user.id]}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
                            bg-red-50 text-red-600 hover:bg-red-100 
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                            ${updatingUsers[user.id] ? 'pr-3' : ''}`}
                        >
                          {updatingUsers[user.id] ? (
                            <>
                              <svg className="animate-spin h-3 w-3 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Updating...</span>
                            </>
                          ) : (
                            'Update'
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-[#82a6f4] transition-colors duration-200"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {user.category === 'customer' && (
                        <button
                          onClick={() => handleUpgradeToFranchise(user.id)}
                          className="p-1 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                          title="Upgrade to franchise"
                        >
                          <ArrowUpCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {user.category === 'franchise' && (
                        <button
                          onClick={() => handleRevertToCustomer(user.id)}
                          className="p-1 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Revert to customer"
                        >
                          <ArrowDownCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

      {isEditModalOpen && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onUpdate={handleUpdateUser}
        />
      )}

      <CreateUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setSelectedUserType(null);
        }}
        onCreateUser={handleCreateUser}
        userType={selectedUserType}
      />
    </div>
  );
};

export default UserConsole;
