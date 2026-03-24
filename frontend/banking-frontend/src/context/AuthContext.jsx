import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user,  setUser]  = useState('')
  const [role,  setRole]  = useState('')

  const login = (jwt, username, userRole) => {
    localStorage.setItem('token',    jwt)
    localStorage.setItem('username', username)
    localStorage.setItem('role',     userRole)
    setToken(jwt)
    setUser(username)
    setRole(userRole)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setToken(null)
    setUser('')
    setRole('')
  }

  const isAdmin   = role === 'ROLE_ADMIN'
  const isAnalyst = role === 'ROLE_ANALYST'

  return (
    <AuthContext.Provider value={{
      token, user, role,
      login, logout,
      isAdmin, isAnalyst,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)