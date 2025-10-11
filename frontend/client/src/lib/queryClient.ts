import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  const token = localStorage.getItem("authToken");

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  const fullUrl = /^https?:\/\//i.test(url)
    ? url
    : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;

  console.log(`🌐 ${method} ${url}`, data ? { data } : '');

  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    if (response.status === 401) {
      console.log("❌ Erro 401 - Token inválido ou expirado");
      if (token) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
      if (window.location.pathname !== "/landing") {
        console.log("🔄 Redirecionando para /landing");
        window.location.href = "/landing";
      }
    }

    const errorText = await response.text();
    console.error(`❌ Erro na requisição: ${response.status}`, errorText);
    throw new Error(`${response.status}: ${errorText}`);
  }

  const text = await response.text();
  console.log(`✅ Resposta ${method} ${url}:`, text ? JSON.parse(text) : null);
  return text ? JSON.parse(text) : null;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const pathFromKey = (queryKey as any[])
      .filter((seg) => seg !== undefined && seg !== null && seg !== "")
      .map(String)
      .join("/");
    const isAbsolute = /^https?:\/\//i.test(pathFromKey);
    const url = isAbsolute
      ? pathFromKey
      : `${API_BASE}${pathFromKey.startsWith('/') ? '' : '/'}${pathFromKey}`;
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
