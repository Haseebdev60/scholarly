import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, subscriptionApi } from '../lib/api'

type User = {
  _id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  // Add a method to manually update user data
  updateUser: (user: User) => void
  register: (data: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => Promise<void>
  logout: () => void
  subscriptionStatus: {
    status: string
    expiryDate: string | null
    isActive: boolean
  } | null
  refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status: string
    expiryDate: string | null
    isActive: boolean
  } | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setToken(storedToken)
      setUser(parsedUser)
      if (parsedUser.role === 'student') {
        refreshSubscription()
      }
    }
    setIsLoading(false)
  }, [])

  const refreshSubscription = async () => {
    try {
      const status = await subscriptionApi.checkStatus()
      setSubscriptionStatus({
        status: status.subscriptionStatus,
        expiryDate: status.subscriptionExpiryDate,
        isActive: status.isActive,
      })
    } catch (error: any) {
      // Only logout on 401 if it's a token valid issue, but we can't easily distinguish from Role issue 
      // unless we know the endpoint returns 403 for role.
      // Assuming api returns 401 for Invalid/Missing token only.
      if (error.name === 'ApiError' && error.status === 401) {
        logout()
      }
      setSubscriptionStatus({ status: 'free', expiryDate: null, isActive: false })
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    setToken(response.token)
    setUser(response.user as User)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    if (response.user.role === 'student') {
      await refreshSubscription()
    }
  }

  const register = async (data: { name: string; email: string; password: string; role: 'student' | 'teacher' }) => {
    const response = await authApi.register(data)
    setToken(response.token)
    setUser(response.user as User)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    await refreshSubscription()
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setSubscriptionStatus(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, subscriptionStatus, refreshSubscription, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
