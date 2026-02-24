import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL      = import.meta.env.VITE_API_URL
const ADMIN_EMAIL  = import.meta.env.VITE_ADMIN_EMAIL

type Stats = {
  users:   { total: number; trial: number; active: number; expired: number; newToday: number; newThisWeek: number }
  revenue: { totalPayments: number; mrr: number; conversionRate: string }
  usage:   { totalActionsLogged: number; topArchiveDomains: {sender_domain: string; total_count: number}[]; topImportantDomains: {sender_domain: string; total_count: number}[] }
}

type User = {
  email: string; name: string; persona: string; subscription_status: string
  trial_end_date: string; paid_until: string; welcome_sent: number
  digest_enabled: number; created_at: string
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function statusBadge(user: User) {
  const now = new Date()
  if (user.subscription_status === 'active') {
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">🟢 Active</span>
  }
  if (user.subscription_status === 'expired') {
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">🔴 Expired</span>
  }
  // trial
  if (user.trial_end_date && new Date(user.trial_end_date) <= now) {
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">🔴 Expired</span>
  }
  const daysLeft = user.trial_end_date
    ? Math.max(0, Math.ceil((new Date(user.trial_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 14
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">🟡 Trial ({daysLeft}d)</span>
}

export default function AdminDashboard() {
  const navigate   = useNavigate()
  const [adminKey, setAdminKey]   = useState<string>(() => localStorage.getItem('adminKey') || '')
  const [keyInput, setKeyInput]   = useState('')
  const [stats,    setStats]      = useState<Stats | null>(null)
  const [users,    setUsers]      = useState<User[]>([])
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')

  // Redirect non-admin users
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail')
    if (ADMIN_EMAIL && userEmail && userEmail !== ADMIN_EMAIL) {
      navigate('/')
    }
  }, [navigate])

  const fetchData = useCallback(async (key: string) => {
    setLoading(true)
    setError('')
    try {
      const headers = { 'X-Admin-Key': key }
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/users`, { headers }),
      ])
      if (statsRes.status === 403 || usersRes.status === 403) {
        setError('Invalid admin key')
        setAdminKey('')
        localStorage.removeItem('adminKey')
        return
      }
      setStats(await statsRes.json())
      setUsers(await usersRes.json())
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (adminKey) fetchData(adminKey)
  }, [adminKey, fetchData])

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) return
    localStorage.setItem('adminKey', keyInput.trim())
    setAdminKey(keyInput.trim())
    setKeyInput('')
  }

  // Password gate
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <form onSubmit={handleKeySubmit} className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-sm text-center">
          <div className="text-3xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your admin key to continue</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Admin key"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm outline-none focus:border-orange-400"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📬 Inbox Purge Pro — Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-sm text-gray-400">Loading…</span>}
            <button
              onClick={() => fetchData(adminKey)}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Refresh ↻
            </button>
            <button
              onClick={() => { localStorage.removeItem('adminKey'); setAdminKey('') }}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* User stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total Users"     value={stats.users.total}       />
              <StatCard label="Trial Users"      value={stats.users.trial}       />
              <StatCard label="Active (Paid)"    value={stats.users.active}      />
              <StatCard label="Expired"          value={stats.users.expired}     />
              <StatCard label="New this week"    value={stats.users.newThisWeek} sub={`${stats.users.newToday} today`} />
            </div>

            {/* Revenue row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="MRR"              value={`₹${stats.revenue.mrr}`}              />
              <StatCard label="Conversion Rate"  value={stats.revenue.conversionRate}          />
              <StatCard label="Total Actions"    value={stats.usage.totalActionsLogged.toLocaleString()} />
            </div>
          </>
        )}

        {/* Users table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Persona</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Trial Ends</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{user.persona?.replace('_', ' ') || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(user)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.trial_end_date
                        ? new Date(user.trial_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : user.paid_until
                          ? `Paid until ${new Date(user.paid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                          : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <p className="text-center text-gray-400 py-8">No users yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
