import { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { C }                    from '../../lib/design'
import { initiateGoogleLogin }  from '../../utils/auth'
import {
  getAccounts,
  saveAccount,
  setActiveEmail,
  type Account,
} from '../../utils/session'

const API_URL = import.meta.env.VITE_API_URL

export default function LoginPage() {
  const navigate  = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading,  setLoading]  = useState<string | null>(null) // email being loaded or 'add'

  useEffect(() => {
    setAccounts(getAccounts())
  }, [])

  const continueAs = async (email: string) => {
    setLoading(email)
    try {
      // Try silent refresh first
      const res = await fetch(`${API_URL}/api/auth/refresh?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        saveAccount({
          email:        data.email,
          name:         data.name || '',
          access_token: data.access_token,
          persona:      data.persona || '',
        })
        setActiveEmail(email)
        localStorage.setItem('accessToken', data.access_token)
        localStorage.setItem('isPremium', 'true')
        if (data.persona) localStorage.setItem('persona', data.persona)
        navigate('/dashboard')
        return
      }
    } catch { /* fall through to OAuth popup */ }

    // Silent refresh failed — trigger OAuth popup
    try {
      const data: { email: string; accessToken: string } = await initiateGoogleLogin() as { email: string; accessToken: string }
      // Check if user is in DB
      const checkRes = await fetch(`${API_URL}/api/auth/refresh?email=${encodeURIComponent(data.email)}`)
      if (checkRes.ok) {
        const refreshed = await checkRes.json()
        saveAccount({
          email:        refreshed.email,
          name:         refreshed.name || '',
          access_token: data.accessToken,
          persona:      refreshed.persona || '',
        })
        setActiveEmail(refreshed.email)
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('isPremium', 'true')
        if (refreshed.persona) localStorage.setItem('persona', refreshed.persona)
        navigate('/dashboard')
      } else {
        // New account — go to onboarding
        navigate('/onboarding')
      }
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setLoading(null)
    }
  }

  const addAccount = async () => {
    setLoading('add')
    try {
      const data: { email: string; accessToken: string } = await initiateGoogleLogin() as { email: string; accessToken: string }
      // Check if this email is in DB
      const checkRes = await fetch(`${API_URL}/api/auth/refresh?email=${encodeURIComponent(data.email)}`)
      if (checkRes.ok) {
        const refreshed = await checkRes.json()
        saveAccount({
          email:        refreshed.email,
          name:         refreshed.name || '',
          access_token: data.accessToken,
          persona:      refreshed.persona || '',
        })
        setActiveEmail(refreshed.email)
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('isPremium', 'true')
        if (refreshed.persona) localStorage.setItem('persona', refreshed.persona)
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      console.error('Add account failed:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.cream }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: C.white, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold" style={{ color: C.navy }}>Inbox Purge Pro</span>
        </div>
        <h2 className="text-center text-lg font-semibold mb-8" style={{ color: C.navyMid }}>
          Welcome back
        </h2>

        {/* Account cards */}
        <div className="space-y-3 mb-4">
          {accounts.map((account) => (
            <button
              key={account.email}
              onClick={() => continueAs(account.email)}
              disabled={loading !== null}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all disabled:opacity-60"
              style={{
                background: '#FAF8F5',
                border:     `1.5px solid ${C.border}`,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = C.orange
                  e.currentTarget.style.background = 'rgba(255,107,53,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.background = '#FAF8F5'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}
                >
                  {(account.name || account.email)[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: C.navy }}>{account.email}</p>
                  {account.name && (
                    <p className="text-xs" style={{ color: C.textMid }}>{account.name}</p>
                  )}
                </div>
              </div>
              <span style={{ color: C.orange }} className="text-lg font-bold">
                {loading === account.email ? '⏳' : '→'}
              </span>
            </button>
          ))}
        </div>

        {/* Add account */}
        <button
          onClick={addAccount}
          disabled={loading !== null}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all disabled:opacity-60"
          style={{
            background: 'transparent',
            border:     `1.5px dashed ${C.border}`,
            color:      C.textMid,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = C.orange
              e.currentTarget.style.color = C.orange
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border
            e.currentTarget.style.color = C.textMid
          }}
        >
          <span className="text-lg">+</span>
          <span className="text-sm font-medium">
            {loading === 'add' ? 'Connecting…' : 'Add another account'}
          </span>
        </button>
      </div>
    </div>
  )
}
