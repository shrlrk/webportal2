import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../services/firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserDataByUid } from '../services/firebase/userService';
import { UserData } from '../types';

interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserDataByUid(firebaseUser.uid);
          setCurrentUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
