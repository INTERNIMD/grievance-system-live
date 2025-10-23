import { projectId, publicAnonKey } from './supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8fa157fc`;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  useAuth = true
) {
  const token = useAuth ? localStorage.getItem('access_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Always send authorization - either user token or anon key
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Failed to parse error response:', textError);
        }
      }
      console.error(`API Error for ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      // If it's already an Error we threw, rethrow it
      if (error.message.includes('Request failed')) {
        throw error;
      }
    }
    // Network error or other fetch error
    console.error(`Network error for ${endpoint}:`, error);
    throw new Error(`Network error: Unable to connect to server. Please check your connection.`);
  }
}

export const api = {
  // Health check
  health: () =>
    apiRequest('/health', {
      method: 'GET',
    }, false),
  
  // Auth
  signup: (name: string, email: string, password: string, role: string = 'student', department?: string) =>
    apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, department }),
    }, false),

  // Grievances
  submitGrievance: (data: {
    title: string;
    description: string;
    isAnonymous?: boolean;
    attachment?: string;
    manualDepartment?: string;
  }) =>
    apiRequest('/grievances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGrievances: (filters?: {
    userOnly?: boolean;
    priority?: string;
    status?: string;
    department?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.userOnly) params.append('userOnly', 'true');
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    
    const query = params.toString();
    return apiRequest(`/grievances${query ? `?${query}` : ''}`);
  },

  getGrievance: (id: string) =>
    apiRequest(`/grievances/${id}`),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/grievances/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addComment: (id: string, comment: string) =>
    apiRequest(`/grievances/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Admin
  getStats: () => apiRequest('/stats'),

  getAILogs: () => apiRequest('/ai/logs'),

  // User stats
  getUserStats: () => apiRequest('/user-stats'),

  // Departments
  getDepartments: () => apiRequest('/departments', {}, false),

  createDepartment: (name: string, description: string) =>
    apiRequest('/departments', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  updateDepartment: (id: string, name: string, description: string) =>
    apiRequest(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    }),

  deleteDepartment: (id: string) =>
    apiRequest(`/departments/${id}`, {
      method: 'DELETE',
    }),

  // User management
  getUsers: () => apiRequest('/users'),

  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};
