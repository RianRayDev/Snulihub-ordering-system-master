import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const sessionEmail = sessionStorage.getItem('sessionEmail');
      const userRole = sessionStorage.getItem('userRole');
      const userId = sessionStorage.getItem('userId');

      if (sessionEmail && userRole && userId) {
        setCurrentUser({
          email: sessionEmail,
          category: userRole,
          id: userId,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Session storage error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where("email", "==", email)
      );
      
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        throw new Error('User not found');
      }

      const userData = {
        id: userSnapshot.docs[0].id,
        ...userSnapshot.docs[0].data()
      };

      if (userData.password !== password) {
        throw new Error('Invalid credentials');
      }

      setCurrentUser({
        ...userData,
        category: userData.category
      });

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
