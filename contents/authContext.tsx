'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState(session?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!session?.user);
  const router = useRouter();

  useEffect(() => {
    setUser(session?.user || null);
    setIsAuthenticated(!!session?.user);
  }, [session]);

  const logout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};