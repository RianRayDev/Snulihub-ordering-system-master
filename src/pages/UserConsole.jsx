import React, { useState, useEffect, useMemo } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp
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
  FunnelIcon
} from '@heroicons/react/24/outline';
import CreateUserModal from '../components/CreateUserModal';
import { useAuth } from '../context/AuthContext';

const db = getFirestore(app);

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
      if (userData.username && userData.category !== 'customer') {
        await userService.validateUsername(userData.username);
      }
      await userService.createUser(userData);
      showNotification('User created successfully!', 'success');
      setIsAddUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Update user
  const handleUpdateUser = async (updates) => {
    try {
      if (updates.username && editingUser.category !== 'customer') {
        await userService.validateUsername(updates.username);
      }
      
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      showNotification('User updated successfully!', 'success');
      setEditingUser(null);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
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
    if (window.confirm('Are you sure you want to upgrade this user to franchise? This will create a new franchise account and transfer all data.')) {
      try {
        await userService.upgradeToFranchise(userId);
        fetchUsers();
      } catch (err) {
        setError('Error upgrading user: ' + err.message);
      }
    }
  };

  // Revert franchise to customer
  const handleRevertToCustomer = async (userId) => {
    if (window.confirm('Are you sure you want to revert this franchise back to customer? This will create a new customer account and transfer all data.')) {
      try {
        await userService.revertToCustomer(userId);
        fetchUsers();
      } catch (err) {
        setError('Error reverting user: ' + err.message);
      }
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

  // Add this helper function
  const needsSchemaUpdate = (user) => {
    // Check for required attributes based on user category
    if (user.category !== 'customer' && !user.username) {
      return true;
    }

    // Check for other required attributes
    const requiredAttributes = {
      isActive: false,
      isOnline: false,
      lastActiveAt: null,
      lastLoginAt: null,
      schemaVersion: 1
    };

    return Object.keys(requiredAttributes).some(attr => !(attr in user));
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
                <tr key={user.id} className="group hover:bg-[#6dc2ff]/5 transition-all duration-200 text-left">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6dc2ff]/10 to-[#6dc2ff]/20 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-[#6dc2ff]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                        <div className="text-xs text-gray-500">
                          {user.id}
                          {user.category !== 'customer' && (
                            <span className="ml-2 text-[#6dc2ff]">@{user.username || 'no-username'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone || 'No phone'}</div>
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
                          onClick={async () => {
                            setUpdatingUsers(prev => ({ ...prev, [user.id]: true }));
                            try {
                              await userService.updateUserAttributes(user.id, user);
                              showNotification('User updated successfully', 'success');
                              fetchUsers();
                            } catch (error) {
                              showNotification(error.message, 'error');
                            } finally {
                              setUpdatingUsers(prev => ({ ...prev, [user.id]: false }));
                            }
                          }}
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
                        className="p-1 text-gray-500 hover:text-[#6dc2ff] rounded-lg hover:bg-[#6dc2ff]/10 transition-colors duration-200"
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
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

      <EditUserModal 
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onUpdate={handleUpdateUser}
      />

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
