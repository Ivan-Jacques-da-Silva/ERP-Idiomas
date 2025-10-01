
// Configuração global da API
export const API_BASE = window.location.hostname === 'erp.vision.dev.br' 
  ? 'https://erpapi.vision.dev.br' 
  : '';

// Interceptador para fetch
export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
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
  
  return response.json();
}
