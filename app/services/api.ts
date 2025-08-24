interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status
    
    try {
      const data = await response.json()
      
      if (!response.ok) {
        // Handle authentication errors
        if (status === 401) {
          localStorage.removeItem('authToken')
          window.location.href = '/auth'
        }
        
        return {
          error: data.message || 'Request failed',
          status,
        }
      }
      
      return {
        data,
        status,
      }
    } catch (error) {
      return {
        error: 'Failed to parse response',
        status,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      
      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })
      
      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })
      
      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      
      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }
}

// Export a singleton instance
export const api = new ApiClient()

// Export types for use in components
export type { ApiResponse } 