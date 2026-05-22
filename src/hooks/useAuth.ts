import { useState, useEffect } from 'react'
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth'
import { auth, firebaseReady } from '../lib/firebase'

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email: string, password: string) => {
    if (!auth) throw new Error('Firebase no configurado')
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    if (!auth) return Promise.resolve()
    return signOut(auth)
  }

  return { user, loading, login, logout }
}
