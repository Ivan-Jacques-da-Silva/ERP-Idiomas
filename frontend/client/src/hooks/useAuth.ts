
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setHasToken(!!token);
    setIsInitialized(true);
  }, []);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasToken && isInitialized, // Only run if we have a token
  });

  return {
    user,
    isLoading: !isInitialized || (hasToken && isLoading),
    isAuthenticated: !!user && !!hasToken,
  };
}
