
// Detecta automaticamente o ambiente
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'erp.vision.dev.br'
);

const isReplit = typeof window !== 'undefined' && (
  window.location.hostname.includes('.repl.co') ||
  window.location.hostname.includes('replit.dev')
);

// Use porta 5052 se estiver rodando localmente na VPS, senão use HTTPS sem porta
export const API_BASE = import.meta.env.VITE_API_URL ||
  (isProduction ? 'https://erpapi.vision.dev.br'
    : isReplit ? 'https://erpapi.vision.dev.br'
      : 'http://localhost:5052');


// Interceptador para fetch
export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    // If token is invalid, clear it
    if (response.status === 401 && token) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if needed
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }

  // Para respostas 204 (No Content), não tente fazer parse do JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
