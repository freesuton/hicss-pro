"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { jwtDecode } from "jwt-decode";

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  introduction?: string
  profile?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, inviteCode?: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

interface DecodedToken {
  sub: string
  name: string
  email: string
  exp: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const AWS_S3_BUCKET_ROOT_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_ROOT_URL;

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!token && !!user

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log("auth context mounted")
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        console.log("storedToken", storedToken)
        if (storedToken) {
          setToken(storedToken)
          // Decode JWT or fetch user data
          const decodedToken: DecodedToken = jwtDecode(storedToken)
          console.log("decodedToken", decodedToken)
          //check if token is expired
          const currentTime = Date.now() / 1000
          if (decodedToken.exp && decodedToken.exp > currentTime) {
            const id = decodedToken.sub
            const name = decodedToken.name
            const email = decodedToken.email
            const avatarUrl = `${AWS_S3_BUCKET_ROOT_URL}/user-uploads/${id}/profile_image.png`;
            setUser({ id, name, email, avatarUrl })
          }else {
            logout()
          }
          // await fetchUserData(storedToken)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const fetchUserData = async (authToken: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // throw new Error('Failed to fetch user data')
        console.log('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // For now, set mock user data
      setUser({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: '/placeholder-user.jpg'
      })
    }
  }

  const login = async (email: string, password: string) => {
    console.log("login", email, password)
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const apiResponse = await response.json()
        
        // Extract data based on your API response structure
        const { authToken, userData } = apiResponse.data
        console.log("authToken", authToken)
        console.log("userData", userData)
        localStorage.setItem('authToken', authToken)
        setToken(authToken)
        setUser(userData)

        toast.success("Login successful")
        
        // Redirect to user's profile page
        if (userData && userData.id) {
          router.push(`/${userData.id}`);
        } else {
          router.push('/profile');
        }
      }else{
        const errorResponse = await response.json()
        // throw new Error(errorResponse.message || 'Login failed')
        toast.error(errorResponse.message || 'Login failed')

      }
    } catch (error) {
      console.error('Login error:', error)
      throw error // Re-throw the error so the auth page can handle it
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, inviteCode?: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, inviteCode }),
      });
      const apiResponse = await response.json();
      if (!apiResponse.success) {
        toast.error(apiResponse.message || "Signup failed");
        return;
      }
      if (!apiResponse.data) {
        toast.error("Signup failed: No data returned.");
        return;
      }
      const { authToken, userData } = apiResponse.data;
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(userData); // Set user data in context
      toast.success("Signup successful");
      if (userData && userData.id) {
        router.push(`/${userData.id}`);
      } else {
        router.push('/profile');
      }

    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    // router.push('/auth')
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const { token: newToken } = await response.json()
        localStorage.setItem('authToken', newToken)
        setToken(newToken)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 