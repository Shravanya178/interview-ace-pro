import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // The auth callback code is automatically handled by Supabase Auth
        // We just need to check if the session is valid
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          console.log("Authentication successful, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          // No session found, something went wrong
          throw new Error(
            "No session found after authentication. Please try again."
          );
        }
      } catch (err: any) {
        console.error("Error in auth callback:", err);
        setError(err.message || "An error occurred during authentication");
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-500">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            Completing authentication...
          </h1>
          <p className="text-gray-500">Please wait while we log you in.</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
