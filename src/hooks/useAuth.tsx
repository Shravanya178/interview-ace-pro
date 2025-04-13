import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for an existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUserFromSupabase(data.session.user);
        } else {
          // No active session
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to get session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserFromSupabase(session.user);
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to transform Supabase user to our User interface
  const setUserFromSupabase = (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    // Extract user data from Supabase user object
    const userData: User = {
      id: supabaseUser.id,
      name:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "",
      email: supabaseUser.email || "",
      photoUrl: supabaseUser.user_metadata?.avatar_url,
      phone: supabaseUser.phone || "",
    };

    setUser(userData);
    // Also store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Set user in state
        setUserFromSupabase(data.user);

        // Show success message
        toast({
          title: "Login successful",
          description: `Welcome back, ${
            data.user.user_metadata?.full_name ||
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

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUserFromSupabase(data.user);
        toast({
          title: "Signup successful",
          description: "You have been successfully signed up!",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Sign in with Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // The user will be redirected to Google for authentication
      // After authentication, they'll be redirected back to the callback URL
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

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setUser(null);
      localStorage.removeItem("user");

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);

    try {
      // First check if we have an active session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("You must be logged in to update your profile");
      }

      // Update user profile through Supabase
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
        // Update local user state
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

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
        signup,
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
