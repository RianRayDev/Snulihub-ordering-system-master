import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const userSchemas = {
  customer: {
    required: {
      id: 'string',
      userId: 'string',
      category: 'string',
      email: 'string',
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      permissions: 'boolean',
      schemaVersion: 'number',
      isActive: 'boolean',
      isOnline: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    optional: {
      address: 'string',
      city: 'string',
      state: 'string',
      country: 'string',
      countryCode: 'string',
      zipCode: 'string',
      phone: 'string',
      primaryPhone: 'string',
      secondaryPhone: 'string',
      cardNumber: 'string',
      cvv: 'string',
      expiryDate: 'string',
      message: 'string',
      sellerMessage: 'string',
      lastActiveAt: 'timestamp',
      lastLoginAt: 'timestamp'
    }
  },
  franchiser: {
    required: {
      id: 'string',
      userId: 'string',
      category: 'string',
      email: 'string',
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      username: 'string',
      permissions: 'boolean',
      schemaVersion: 'number',
      isActive: 'boolean',
      isOnline: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    optional: {
      address: 'string',
      city: 'string',
      state: 'string',
      country: 'string',
      countryCode: 'string',
      zipCode: 'string',
      phone: 'string',
      primaryPhone: 'string',
      secondaryPhone: 'string',
      lastActiveAt: 'timestamp',
      lastLoginAt: 'timestamp'
    }
  },
  test: {
    required: {
      id: 'string',
      userId: 'string',
      category: 'string',
      email: 'string',
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      permissions: 'boolean',
      schemaVersion: 'number',
      isActive: 'boolean',
      isOnline: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    optional: {
      lastActiveAt: 'timestamp',
      lastLoginAt: 'timestamp'
    }
  }
};

export const userService = {
  // Create user
  async createUser(userData) {
    try {
      // Validate required fields
      const requiredFields = ['email', 'firstName', 'lastName', 'category', 'id'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Create user document with specific ID
      const userRef = doc(db, 'users', userData.id);
      
      // Check if user already exists
      const existingUser = await getDoc(userRef);
      if (existingUser.exists()) {
        throw new Error('User ID already exists');
      }

      // Create user with all required fields
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isOnline: false,
        lastActiveAt: null,
        lastLoginAt: null,
        schemaVersion: 1
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  // Read user
  async getUserById(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() };
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentData = userDoc.data();

      // If category is changing, handle in the component level
      if (userData.category && userData.category !== currentData.category) {
        return true; // Let the component handle category changes
      }

      // Handle regular updates
      const updateData = {
        ...currentData,
        ...userData,
        updatedAt: new Date()
      };

      // Remove any undefined or empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  // Delete user
  async deleteUser(userId) {
    await deleteDoc(doc(db, 'users', userId));
  },

  // Validate user role
  async validateUserRole(userId, requiredRole) {
    const user = await this.getUserById(userId);
    return user.category === requiredRole;
  },

  async getUserByEmail(email) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  },

  async getUserByUsername(username) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  },

  async upgradeToFranchise(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (userData.category !== 'customer') {
        throw new Error('Only customers can be upgraded to franchise');
      }

      await updateDoc(userRef, {
        category: 'franchise',
        updatedAt: new Date(),
        permissions: false // Default franchise permissions
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to upgrade user: ${error.message}`);
    }
  },

  async revertToCustomer(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      if (userData.category !== 'franchise') {
        throw new Error('Only franchise users can be reverted to customer');
      }

      await updateDoc(userRef, {
        category: 'customer',
        updatedAt: new Date(),
        permissions: false
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to revert user: ${error.message}`);
    }
  },

  async updateUserAttributes(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentData = userDoc.data();

      // Prepare the complete update data
      const updateData = {
        ...currentData,
        ...userData,
        id: userData.id || currentData.id,
        userId: userData.id || currentData.id, // Ensure userId matches id
        schemaVersion: 1,
        updatedAt: new Date(),
        isActive: userData.isActive ?? currentData.isActive ?? true,
        isOnline: userData.isOnline ?? currentData.isOnline ?? false,
        lastActiveAt: userData.lastActiveAt ?? currentData.lastActiveAt ?? null,
        lastLoginAt: userData.lastLoginAt ?? currentData.lastLoginAt ?? null,
        permissions: userData.permissions ?? currentData.permissions ?? false,
        phone: userData.phone ?? currentData.phone ?? '',
        createdAt: currentData.createdAt || new Date()
      };

      // Ensure all dates are properly formatted
      ['createdAt', 'updatedAt', 'lastActiveAt', 'lastLoginAt'].forEach(field => {
        if (updateData[field] && typeof updateData[field].toDate === 'function') {
          updateData[field] = updateData[field].toDate();
        }
      });

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('Update error:', error);
      throw new Error(`Failed to update user attributes: ${error.message}`);
    }
  }
};

export default userService;
