
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

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
    queryKey: ["auth", "user"],
    queryFn: async () => {
      return await apiRequest("/api/auth/user", {
        method: "GET",
      });
    },
    retry: false,
    enabled: hasToken && isInitialized,
  });

  const { data: effectivePerms } = useQuery<{ permissions: { name: string }[] }>({
    queryKey: ["auth", "effective-permissions"],
    queryFn: async () => {
      return await apiRequest("/api/auth/effective-permissions", { method: "GET" });
    },
    retry: false,
    enabled: !!user && hasToken && isInitialized,
  });

  return {
    user,
    isLoading: !isInitialized || (hasToken && isLoading),
    isAuthenticated: !!user && !!hasToken,
    permissions: (effectivePerms?.permissions || []).map(p => p.name),
  };
}
