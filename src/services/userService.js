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

export const userService = {
  // Create user
  async createUser(userData) {
    const userRef = doc(collection(db, 'users'));
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      isActive: true
    });
    return userRef.id;
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
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
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
  }
};

export default userService;
