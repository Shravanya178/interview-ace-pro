import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define Supabase user type
interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

// Demo user for auto-login
const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@example.com',
  photoUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // For demo purposes, auto-login with demo user
    setUser(DEMO_USER);
    localStorage.setItem('user', JSON.stringify(DEMO_USER));
    setIsLoading(false);
    
    // Uncomment this for actual authentication
    /*
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUserFromSupabase(data.session.user);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setIsLoading(false);
    */
  }, []);

  // Helper function to transform Supabase user to our User interface
  const setUserFromSupabase = (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    // Extract user data from Supabase user object
    const userData: User = {
      id: supabaseUser.id,
      name:
        supabaseUser.user_metadata.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "",
      email: supabaseUser.email || "",
      photoUrl: supabaseUser.user_metadata.avatar_url,
      phone: supabaseUser.phone || "",
    };

    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUserFromSupabase(data.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${
            data.user.user_metadata.full_name ||
            data.user.email?.split("@")[0] ||
            "user"
          }!`,
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error.message || "An error occurred during Google login.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithPhone = async (phone: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${phone}.`,
      });
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast({
        title: "Phone login failed",
        description: error.message || "An error occurred during phone login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUserFromSupabase(data.user);
        toast({
          title: "Phone verification successful",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: error.message || "An error occurred during verification.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // For demo, set back to demo user instead of logging out completely
    setUser(DEMO_USER);
    localStorage.setItem('user', JSON.stringify(DEMO_USER));
    
    toast({
      title: "Demo mode active",
      description: "Using demo account for demonstration.",
    });
    
    // Uncomment for actual logout
    /*
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    */
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          avatar_url: data.photoUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Profile update failed",
        description:
          error.message || "An error occurred during profile update.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        loginWithPhone,
        verifyPhoneOtp,
        logout,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
