import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // ✅ ALWAYS start as null — never read from localStorage on startup
  // This forces login page every time app starts or refreshes
  const [token, setToken] = useState(null)
  const [user,  setUser]  = useState('')

  const login = (jwt, username) => {
    localStorage.setItem('token', jwt)
    localStorage.setItem('username', username)
    setToken(jwt)
    setUser(username)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUser('')
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)