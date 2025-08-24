"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const { login, signup, isLoading } = useAuth()
  const router = useRouter()
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: ""
  })

  // Password validation state
  const [passwordError, setPasswordError] = useState<string>("")

  // Password validation function
  const validatePassword = (password: string) => {
    if (password.length === 0) return ""
    
    const errors = []
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long")
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Password must contain at least one letter")
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    
    return errors.join(", ")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setSignupData({ ...signupData, password: newPassword })
    
    // Real-time validation
    const error = validatePassword(newPassword)
    setPasswordError(error)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    await login(loginData.email, loginData.password)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate password requirements
    const passwordErrors = validatePassword(signupData.password)
    if (passwordErrors) {
      setError(passwordErrors)
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    await signup(signupData.name, signupData.email, signupData.password, signupData.inviteCode)
  }

  const handleSocialLogin = async (provider: string) => {
    console.log(`Login with ${provider}`)
    // For demo purposes, use mock credentials
    await login('demo@example.com', 'password')
  }

  const testHelloApi = async () => {
    try {
      const response = await fetch('/api/hello')
      const data = await response.json()
      toast.success(`API Response: ${data.message}`)
      console.log('Hello API response:', data)
    } catch (error) {
      toast.error('Failed to call hello API')
      console.error('Hello API error:', error)
    }
  }

  return (
    <div className=" bg-gradient-to-br from-blue-500 via-blue-400 to-pink-400 relative flex flex-col"
    style={{ height: "calc(100vh - 76px)" }}
    >
      {/* Navigation */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2 mt-2">
        <button className="text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-gray-200 text-xs font-medium flex items-center gap-2">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="bg-white/30 px-3 py-0.5 rounded-full font-semibold text-xs text-white shadow-sm">
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="text-center mb-2 mt-3">
        <h1 className="text-white text-3xl font-extrabold tracking-tight">Nenki</h1>
      </div>

      {/* Main Content Card */}
      <div
        className="bg-white h-full overflow-y-auto rounded-t-2xl flex flex-col justify-start px-4 pt-4 pb-3 shadow-none"
        // style={{ height: "calc(100vh - 76px)" }}
      >
        <div className="w-full max-w-md mx-auto px-2">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          {/* <p className="text-gray-500 mb-4 text-sm">{isSignUp ? "Enter your details to get started" : "Enter your details below"}</p> */}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          {!isSignUp && (
            <form onSubmit={handleLogin} className="space-y-3 w-full">
              <div className="w-full">
                <Label htmlFor="email" className="text-gray-500 text-xs mb-1 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nicholas@ergemla.com"
                  className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm shadow-sm placeholder:text-gray-400"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="w-full">
                <Label htmlFor="password" className="text-gray-500 text-xs mb-1 block">
                  Password
                </Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm pr-10 shadow-sm placeholder:text-gray-400"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-pink-400 hover:from-blue-700 hover:to-pink-500 text-white rounded-xl text-base font-bold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center">
                <Link href="/forgot-password" className="text-gray-400 text-sm">
                  Forgot your password?
                </Link>
              </div>

              {/* <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={testHelloApi}
              >
                Test Hello API
              </Button> */}
            </form>
          )}

          {/* Sign Up Form */}
          {isSignUp && (
            <form onSubmit={handleSignup} className="space-y-3 w-full">
              <div className="w-full">
                <Label htmlFor="signup-email" className="text-gray-500 text-xs mb-1 block">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm shadow-sm placeholder:text-gray-400"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>
              <div className="w-full">
                <Label htmlFor="signup-name" className="text-gray-500 text-xs mb-1 block">
                  Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm shadow-sm placeholder:text-gray-400"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                />
              </div>
              <div className="w-full">
                <Label htmlFor="signup-invite-code" className="text-gray-500 text-xs mb-1 block">
                  Invite Code
                </Label>
                <Input
                  id="signup-invite-code"
                  type="text"
                  placeholder="Enter your invite code"
                  className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm shadow-sm placeholder:text-gray-400"
                  value={signupData.inviteCode}
                  onChange={(e) => setSignupData({ ...signupData, inviteCode: e.target.value })}
                  required
                />
              </div>
              <div className="w-full">
                <Label htmlFor="signup-password" className="text-gray-500 text-xs mb-1 block">
                  Password
                </Label>
                <div className="relative w-full">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm pr-10 shadow-sm placeholder:text-gray-400"
                    value={signupData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div className="w-full">
                <Label htmlFor="signup-confirm-password" className="text-gray-500 text-xs mb-1 block">
                  Confirm Password
                </Label>
                <div className="relative w-full">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full h-10 border-2 border-gray-200 rounded-xl text-sm pr-10 shadow-sm placeholder:text-gray-400"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-pink-400 hover:from-blue-700 hover:to-pink-500 text-white rounded-xl text-base font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !!passwordError || signupData.password.length === 0}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Divider */}
          {/* <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">Or sign in with</span>
            </div>
          </div> */}

          {/* Social Login Buttons */}
          {/* <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Google</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              className="h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-1" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Facebook</span>
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  )
}
