const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

export async function apiCall(endpoint: string, data: unknown): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}
