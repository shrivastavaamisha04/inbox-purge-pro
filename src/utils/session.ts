const API_URL = import.meta.env.VITE_API_URL

export interface Account {
  email:        string
  name:         string
  access_token: string
  persona:      string
}

const ACCOUNTS_KEY    = 'accounts'
const ACTIVE_EMAIL_KEY = 'activeEmail'

export function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveAccount(account: Account): void {
  const accounts = getAccounts()
  const idx = accounts.findIndex((a) => a.email === account.email)
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...account }
  } else {
    accounts.push(account)
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  // Also keep legacy keys for backward-compat with existing Dashboard code
  localStorage.setItem('accessToken', account.access_token)
  localStorage.setItem('userEmail', account.email)
}

export function removeAccount(email: string): void {
  const accounts = getAccounts().filter((a) => a.email !== email)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getActiveEmail(): string | null {
  return localStorage.getItem(ACTIVE_EMAIL_KEY) || localStorage.getItem('userEmail')
}

export function setActiveEmail(email: string): void {
  localStorage.setItem(ACTIVE_EMAIL_KEY, email)
  localStorage.setItem('userEmail', email)
}

export function getActiveAccount(): Account | null {
  const email = getActiveEmail()
  if (!email) return null
  return getAccounts().find((a) => a.email === email) || null
}

// Called on every app load — silently refreshes session via backend
export async function restoreSession(): Promise<Account | null> {
  const email = getActiveEmail()
  if (!email) return null
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh?email=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const data = await res.json()
    const account: Account = {
      email:        data.email,
      name:         data.name || '',
      access_token: data.access_token,
      persona:      data.persona || localStorage.getItem('persona') || '',
    }
    saveAccount(account)
    setActiveEmail(account.email)
    // Keep legacy keys fresh
    localStorage.setItem('accessToken', account.access_token)
    localStorage.setItem('isPremium', 'true')
    if (account.persona) localStorage.setItem('persona', account.persona)
    return account
  } catch {
    return null
  }
}
