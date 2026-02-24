import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initiateGoogleLogin, getAccessToken, getUserEmail } from '../../utils/auth'
import {
  getAccounts,
  saveAccount,
  setActiveEmail,
  restoreSession,
  type Account,
} from '../../utils/session'

const API_URL = import.meta.env.VITE_API_URL

// ── Types ─────────────────────────────────────────────────────────────────────
type Email = {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
  labelIds: string[]
  trashiness_score: number
}

type Summary = {
  total: number
  highTrash: number
  medium: number
  important: number
}

type Filter = 'all' | 'trash' | 'medium' | 'important'

type Rule = {
  id: string
  text: string
  enabled: boolean
  prebuilt?: boolean
  domain?: string
  label?: string
}

const RULE_PLACEHOLDERS = [
  'Put all LinkedIn emails in one folder, mark job posts as important',
  'Archive all Calendly emails',
  'Mark emails from my bank as Important',
  'Label all GitHub notifications',
  'Archive newsletter digests automatically',
]

type ParsedRule = {
  description: string
  label: string
  gmailQuery: string
  action: string
  priorityConditions: { keywords: string[]; markImportant: boolean }
}

type RulePreviewEmail = {
  from: string
  subject: string
  date: string
}

type PaymentStatus = {
  status:       'trial' | 'active' | 'expired'
  daysRemaining: number
  trialEndDate:  string | null
  paidUntil:     string | null
}

// ── Premium Sidebar ───────────────────────────────────────────────────────────
function PremiumSidebar({
  persona,
  rules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onAddPrebuiltRule,
  onBulkUpdateRules,
  accessToken,
  userEmail,
}: {
  persona: string | null
  rules: Rule[]
  onAddRule: (text: string) => void
  onToggleRule: (id: string) => void
  onDeleteRule: (id: string) => void
  onAddPrebuiltRule: (rule: Rule) => void
  onBulkUpdateRules: (rules: Rule[]) => void
  accessToken: string | null
  userEmail: string
}) {
  const [collapsed,         setCollapsed]         = useState(false)
  const [input,             setInput]             = useState('')
  const [testing,           setTesting]           = useState(false)
  const [applying,          setApplying]          = useState(false)
  const [message,           setMessage]           = useState('')
  const [parsedRule,        setParsedRule]        = useState<ParsedRule | null>(null)
  const [previewEmails,     setPreviewEmails]     = useState<RulePreviewEmail[]>([])
  const [previewTotal,      setPreviewTotal]      = useState(0)
  const [refinementNote,    setRefinementNote]    = useState('')
  const [clearingLabel,     setClearingLabel]     = useState<string | null>(null)
  const [placeholder,       setPlaceholder]       = useState(RULE_PLACEHOLDERS[0])
  const [showRuleLibrary,   setShowRuleLibrary]   = useState(false)
  const [prebuiltLibrary,   setPrebuiltLibrary]   = useState<any[]>([])
  const [libraryGrouped,    setLibraryGrouped]    = useState<Record<string, any[]>>({})
  const [ruleFilter,        setRuleFilter]        = useState('all')
  const phIdx = useRef(0)

  const fetchPrebuiltLibrary = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/prebuilt-rules`)
      const data = await res.json()
      setPrebuiltLibrary(data.rules || [])
      setLibraryGrouped(data.grouped || {})
    } catch { /* non-fatal */ }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      phIdx.current = (phIdx.current + 1) % RULE_PLACEHOLDERS.length
      setPlaceholder(RULE_PLACEHOLDERS[phIdx.current])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleTest = async () => {
    if (!input.trim()) return
    setTesting(true)
    setMessage('')
    setParsedRule(null)
    setPreviewEmails([])
    setPreviewTotal(0)
    setRefinementNote('')
    try {
      // Single agentic call: Claude tests the query on the real inbox and self-corrects
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/api/claude/build-rule`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rule: input.trim(), accessToken: token, userEmail }),
      })
      if (!res.ok) throw new Error('Failed to build rule')
      const data = await res.json()
      if (!data.gmailQuery) {
        setMessage('❌ Rule is too complex for one query. Try two simpler rules — e.g. one for "Bank marketing emails" and one for "Bank transfer alerts".')
        return
      }
      setParsedRule({
        description:        data.description,
        label:              data.label,
        gmailQuery:         data.gmailQuery,
        action:             data.action || 'label',
        priorityConditions: data.priorityConditions || { keywords: [], markImportant: false },
      })
      setPreviewEmails(data.previewEmails || [])
      setPreviewTotal(data.previewTotal || 0)
      if (data.verificationNote) setRefinementNote(data.verificationNote)
    } catch (err: unknown) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'Failed to build rule'}`)
    } finally {
      setTesting(false)
    }
  }

  const handleApply = async () => {
    if (!parsedRule) return
    const token = getAccessToken()
    if (!token) { setMessage('❌ Not authenticated'); return }
    setApplying(true)
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/api/gmail/apply-rule`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ rule: parsedRule }),
      })
      if (!res.ok) throw new Error('Failed to apply rule')
      const data = await res.json()
      onAddRule(input.trim())
      setInput('')
      setParsedRule(null)
      setPreviewEmails([])
      setPreviewTotal(0)
      setMessage(`✅ Applied! ${data.labeled} emails labeled${data.markedImportant ? `, ${data.markedImportant} marked Important` : ''}.`)
    } catch (err: unknown) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'Apply failed'}`)
    } finally {
      setApplying(false)
    }
  }

  const personaLabels: Record<string, string> = {
    startup_founder:      '🚀 Startup Founder',
    working_professional: '💼 Working Professional',
    student:              '🎓 Student',
    freelancer:           '🎨 Freelancer / Creator',
  }

  const ruleDomains = [...new Set(rules.filter(r => r.prebuilt && r.domain).map(r => r.domain as string))]
  const hasCustomRules = rules.some(r => !r.prebuilt)
  const showRuleFilter = rules.length > 0 && ruleDomains.length > 0 && (hasCustomRules || ruleDomains.length > 1)
  const ruleFilterTabs = ['all', ...(hasCustomRules ? ['custom'] : []), ...ruleDomains]
  const filteredRules = ruleFilter === 'all'
    ? rules
    : ruleFilter === 'custom'
      ? rules.filter(r => !r.prebuilt)
      : rules.filter(r => r.domain === ruleFilter)

  return (
    <div
      className="flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? '3.5rem' : '20rem' }}
    >
      <div
        className="relative h-full rounded-xl overflow-hidden flex flex-col"
        style={{ background: '#fff', border: '1px solid #E8E4DF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #E8E4DF', background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-bold">⚙️ My Rules</span>
              {persona && (
                <span className="text-xs text-white/70">{personaLabels[persona] ?? persona}</span>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-white/80 hover:text-white text-lg leading-none ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {!collapsed && (
          <>
            <div className="flex-shrink-0 mx-4 mt-3 mb-1 rounded-xl p-3"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,140,66,0.05))', border: '1px solid rgba(255,107,53,0.2)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">📚 Rule Library</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    Auto-sort your inbox with pre-built rules for banking, travel, healthcare & more — applied as Gmail labels automatically.
                  </p>
                </div>
                <button
                  onClick={() => { setShowRuleLibrary(true); fetchPrebuiltLibrary() }}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition"
                  style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}
                >
                  Browse →
                </button>
              </div>
              {rules.filter(r => r.prebuilt && r.enabled).length > 0 && (
                <p className="text-xs mt-2 font-medium" style={{ color: '#FF6B35' }}>
                  ✓ {rules.filter(r => r.prebuilt && r.enabled).length} library rules active
                </p>
              )}
            </div>
          <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4">
            {showRuleFilter && (
              <div className="flex gap-1.5 overflow-x-auto flex-shrink-0 py-1"
                style={{ scrollbarWidth: 'none' }}>
                {ruleFilterTabs.map(f => (
                  <button
                    key={f}
                    onClick={() => setRuleFilter(f)}
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition"
                    style={{
                      background: ruleFilter === f ? '#FF6B35' : '#F0EDE9',
                      color: ruleFilter === f ? '#fff' : '#6B7280',
                    }}
                  >
                    {f === 'all' ? 'All' : f === 'custom' ? '✏️ Custom' : f}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {rules.length === 0 ? (
                <p className="text-xs text-gray-400 text-center mt-4">No rules yet. Add one below.</p>
              ) : filteredRules.length === 0 ? (
                <p className="text-xs text-gray-400 text-center mt-4">No rules in this category.</p>
              ) : (
                filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-2 p-3 rounded-lg text-sm"
                    style={{ background: rule.enabled ? 'rgba(255,107,53,0.05)' : '#F9F8F6', border: '1px solid #E8E4DF' }}
                  >
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => onToggleRule(rule.id)}
                      className="mt-0.5 accent-orange-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {rule.prebuilt && rule.domain && (
                        <span className="text-xs px-1.5 py-0.5 rounded mb-1 inline-block font-medium"
                          style={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35' }}>
                          {rule.domain}
                        </span>
                      )}
                      <span
                        className="leading-snug block"
                        style={{ color: rule.enabled ? '#1B2A3B' : '#9CA3AF', textDecoration: rule.enabled ? 'none' : 'line-through' }}
                      >
                        {rule.text}
                      </span>
                      {accessToken && (
                        <button
                          onClick={async () => {
                            const labelName = rule.label ?? (() => {
                              const asMatch    = rule.text.match(/\bas\s+([A-Za-z0-9/_\- ]+?)(?:\s*$)/i)
                              const quoteMatch = rule.text.match(/['"]([^'"]+)['"]/g)
                              const labelMatch = rule.text.match(/^label\s+(.+)/i)
                              return asMatch?.[1]?.trim()
                                ?? (quoteMatch ? quoteMatch[quoteMatch.length - 1].replace(/['"]/g, '') : null)
                                ?? labelMatch?.[1]?.trim()
                                ?? null
                            })()
                            if (!labelName) { alert('Could not detect label name. Remove manually in Gmail.'); return }
                            if (!confirm(`Remove the "${labelName}" label from ALL emails in Gmail?`)) return
                            setClearingLabel(rule.id)
                            try {
                              await fetch(`${API_URL}/api/gmail/remove-label`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                                body: JSON.stringify({ labelName }),
                              })
                            } finally { setClearingLabel(null) }
                          }}
                          disabled={clearingLabel === rule.id}
                          className="text-xs mt-1 text-gray-400 hover:text-red-400 transition disabled:opacity-40"
                        >
                          {clearingLabel === rule.id ? 'Clearing…' : '↩ Undo label'}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-gray-300 hover:text-red-400 transition flex-shrink-0 text-base leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex-shrink-0 space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                New Rule (plain English)
              </label>
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setParsedRule(null); setPreviewEmails([]); setPreviewTotal(0); setMessage(''); setRefinementNote('') }}
                placeholder={placeholder}
                rows={3}
                className="w-full text-sm px-3 py-2.5 rounded-lg resize-none outline-none transition-all"
                style={{ background: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#1B2A3B' }}
                onFocus={(e)  => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e)   => (e.target.style.borderColor = '#E8E4DF')}
              />

              {parsedRule && (
                <div
                  className="rounded-lg p-3 text-xs space-y-2"
                  style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.2)' }}
                >
                  <p className="font-semibold text-gray-700">Preview</p>
                  <div className="space-y-1">
                    <p><span className="font-medium text-gray-600">Description:</span> {parsedRule.description}</p>
                    <p><span className="font-medium text-gray-600">Label:</span> {parsedRule.label}</p>
                    <p><span className="font-medium text-gray-600">Query:</span> <span className="font-mono break-all">{parsedRule.gmailQuery}</span></p>
                    {refinementNote && (
                      <p className="text-xs mt-1 px-2 py-1.5 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: '#16A34A', border: '1px solid rgba(34,197,94,0.2)' }}>
                        ✅ Verified on your inbox: {refinementNote}
                      </p>
                    )}
                    {parsedRule.priorityConditions?.markImportant && (
                      <p className="text-orange-600 font-medium">
                        ⭐ Will mark {parsedRule.priorityConditions.keywords?.length || 0} keywords as Important
                      </p>
                    )}
                  </div>

                  {previewEmails.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      <p className="font-semibold text-gray-600">
                        Matching emails in your inbox
                        {previewTotal > previewEmails.length && (
                          <span className="text-gray-400 font-normal"> (~{previewTotal} total)</span>
                        )}
                      </p>
                      <div className="rounded overflow-hidden" style={{ border: '1px solid #E8E4DF' }}>
                        {previewEmails.map((e, i) => (
                          <div
                            key={i}
                            className="flex gap-2 px-2 py-1.5"
                            style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: i < previewEmails.length - 1 ? '1px solid #F0EDE9' : 'none' }}
                          >
                            <span className="truncate font-medium text-gray-700 w-24 flex-shrink-0">
                              {e.from.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() || e.from.split('@')[0]}
                            </span>
                            <span className="truncate text-gray-500 flex-1">{e.subject || '(no subject)'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : parsedRule && (
                    <p className="text-gray-400 italic">No matching emails found in your inbox.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={!input.trim() || testing}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: '#FAF8F5', border: '1.5px solid #E8E4DF', color: '#4A5568' }}
                >
                  {testing ? '🔍 Analyzing…' : '🧪 Test'}
                </button>
                <button
                  onClick={handleApply}
                  disabled={!parsedRule || applying}
                  className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}
                >
                  {applying ? '⏳ Applying…' : '✓ Apply'}
                </button>
              </div>
              {message && (
                <p className="text-xs text-center font-medium" style={{ color: message.startsWith('✅') ? '#22C55E' : '#EF4444' }}>
                  {message}
                </p>
              )}
            </div>
          </div>
          </>
        )}

        {showRuleLibrary && (
          <div className="absolute inset-x-0 top-0 z-20 flex flex-col rounded-xl overflow-hidden max-h-full"
            style={{ background: '#FFFFFF', border: '1px solid #E8E4DF' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid #E8E4DF', background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}>
              <div>
                <p className="font-bold text-white text-sm">📚 Rule Library</p>
                <p className="text-xs text-orange-100">Activate rules to auto-label your inbox</p>
              </div>
              <button onClick={() => setShowRuleLibrary(false)}
                className="text-white text-lg leading-none hover:opacity-70 transition">×</button>
            </div>

            {/* Enable all toggle */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid #E8E4DF', background: '#FAF8F5' }}>
              <div>
                <p className="text-xs font-bold text-gray-700">Enable all rules</p>
                <p className="text-xs text-gray-400">
                  {prebuiltLibrary.length} rules · toggle individual rules below to customise
                </p>
              </div>
              <div
                className="w-12 h-6 rounded-full cursor-pointer transition-all flex items-center"
                style={{
                  background: prebuiltLibrary.every(lr => rules.some(ur => ur.id === lr.id && ur.enabled))
                    ? '#FF6B35' : '#E8E4DF',
                  padding: '2px'
                }}
                onClick={() => {
                  const allActive = prebuiltLibrary.every(lr => rules.some(ur => ur.id === lr.id && ur.enabled))
                  let next: Rule[]
                  if (allActive) {
                    next = rules.map(r => r.prebuilt ? { ...r, enabled: false } : r)
                  } else {
                    const existingIds = new Set(rules.map(r => r.id))
                    const toAdd: Rule[] = prebuiltLibrary
                      .filter(lr => !existingIds.has(lr.id))
                      .map(lr => ({
                        id: lr.id,
                        text: lr.description,
                        enabled: true,
                        prebuilt: true,
                        domain: lr.domain,
                        label: lr.label,
                      }))
                    next = [
                      ...rules.map(r => r.prebuilt ? { ...r, enabled: true } : r),
                      ...toAdd
                    ]
                  }
                  onBulkUpdateRules(next)
                }}
              >
                <div className="w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: prebuiltLibrary.every(lr => rules.some(ur => ur.id === lr.id && ur.enabled))
                      ? 'translateX(24px)' : 'translateX(0)'
                  }} />
              </div>
            </div>

            {/* Domain sections */}
            <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-4">
              {Object.entries(libraryGrouped).map(([domain, domainRules]) => {
                const activatedCount = domainRules.filter(r =>
                  rules.some(ur => ur.id === r.id && ur.enabled)
                ).length
                return (
                  <div key={domain}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{domain}</p>
                      {activatedCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(255,107,53,0.1)', color: '#FF6B35' }}>
                          {activatedCount} active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {(domainRules as any[]).map((libRule: any) => {
                        const isActive = rules.some(ur => ur.id === libRule.id && ur.enabled)
                        const priorityColor = libRule.priority === 'high' ? '#EF4444' : libRule.priority === 'medium' ? '#F59E0B' : '#9CA3AF'
                        const priorityLabel = libRule.priority === 'high' ? '🔴 High' : libRule.priority === 'medium' ? '🟡 Medium' : '⚪ Low'
                        return (
                          <div key={libRule.id}
                            className="flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition"
                            style={{
                              background: isActive ? 'rgba(255,107,53,0.05)' : '#FAF8F5',
                              border: `1px solid ${isActive ? 'rgba(255,107,53,0.3)' : '#E8E4DF'}`
                            }}
                            onClick={() => {
                              const alreadyExists = rules.find(ur => ur.id === libRule.id)
                              if (alreadyExists) {
                                onToggleRule(libRule.id)
                              } else {
                                onAddPrebuiltRule({
                                  id: libRule.id,
                                  text: libRule.description,
                                  enabled: true,
                                  prebuilt: true,
                                  domain: libRule.domain,
                                  label: libRule.label,
                                })
                              }
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs leading-snug"
                                style={{ color: isActive ? '#1B2A3B' : '#6B7280' }}>
                                {libRule.description}
                              </p>
                              <p className="text-xs mt-0.5 font-medium" style={{ color: priorityColor }}>
                                {priorityLabel}
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-8 h-5 rounded-full transition-all flex items-center"
                              style={{ background: isActive ? '#FF6B35' : '#E8E4DF', padding: '2px' }}>
                              <div className="w-4 h-4 rounded-full bg-white transition-transform"
                                style={{ transform: isActive ? 'translateX(12px)' : 'translateX(0)' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid #E8E4DF' }}>
              <p className="text-xs text-gray-400 text-center">
                Active rules apply <strong>Inbox Purge ·</strong> labels in Gmail automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sign Out Modal ────────────────────────────────────────────────────────────
function SignOutModal({
  onConfirm,
  onAddAccount,
  onCancel,
  addingAccount,
}: {
  onConfirm: () => void
  onAddAccount: () => void
  onCancel: () => void
  addingAccount: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
        <div className="text-3xl mb-3 text-center">👋</div>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Sign out?</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          You'll need to reconnect Gmail next time. Your rules and preferences are saved.
        </p>
        <div className="space-y-2">
          <button
            onClick={onAddAccount}
            disabled={addingAccount}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            style={{ background: 'rgba(255,107,53,0.08)', border: '1.5px solid rgba(255,107,53,0.3)', color: '#FF6B35' }}
          >
            {addingAccount ? 'Connecting…' : '+ Add another account instead'}
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: '#EF4444' }}
          >
            Sign out
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Trial Banner ───────────────────────────────────────────────────────────────
function TrialBanner({ daysRemaining, onActivate }: { daysRemaining: number; onActivate: () => void }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg,rgba(255,107,53,0.08),rgba(255,140,66,0.08))', border: '1.5px solid rgba(255,107,53,0.25)' }}
    >
      <div>
        <p className="font-bold text-sm" style={{ color: '#FF6B35' }}>
          ⏳ {daysRemaining} days left in your free trial · ₹89/month after
        </p>
        <p className="text-xs mt-0.5 text-gray-500">
          No card needed during trial. Activate Premium to keep your rules and preferences.
        </p>
      </div>
      <button
        onClick={onActivate}
        className="flex-shrink-0 px-5 py-2 rounded-lg text-sm font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)', boxShadow: '0 4px 14px rgba(255,107,53,0.35)' }}
      >
        Activate Premium
      </button>
    </div>
  )
}

// ── Razorpay Payment Modal ─────────────────────────────────────────────────────
function PaymentModal({ email, onClose, onSuccess }: { email: string; onClose?: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      if (!orderRes.ok) throw new Error('Failed to create order')
      const { orderId, amount, currency, keyId } = await orderRes.json()

      // Dynamically load Razorpay checkout script
      await new Promise<void>((resolve, reject) => {
        if ((window as unknown as { Razorpay?: unknown }).Razorpay) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload  = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(script)
      })

      const rzp = new (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay({
        key:         keyId,
        amount,
        currency,
        order_id:    orderId,
        name:        'Inbox Purge Pro',
        description: '₹89/month · Premium Access',
        prefill:     { email },
        theme:       { color: '#FF6B35' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                email,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            })
            if (verifyRes.ok) {
              onSuccess()
            } else {
              setError('Payment verification failed. Contact support.')
            }
          } catch {
            setError('Payment verification failed. Contact support.')
          }
        },
      })
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Keep your inbox organised
        </h2>
        <p className="text-sm text-gray-400 mb-1 break-all">{email}</p>
        <p className="text-sm text-gray-500 mb-2">Your free trial has ended.</p>
        <div className="text-3xl font-bold my-4" style={{ color: '#FF6B35' }}>₹89<span className="text-base font-normal text-gray-500">/month</span></div>
        <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
          {['Unlimited inbox scans', 'Behavioral AI', 'Custom rules in plain English', 'Daily digest 30 min after your scan'].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> {f}
            </li>
          ))}
        </ul>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)', boxShadow: '0 4px 14px rgba(255,107,53,0.35)' }}
        >
          {loading ? 'Processing…' : 'Pay ₹89/month →'}
        </button>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
            Maybe later
          </button>
        )}
      </div>
    </div>
  )
}

// ── Account Switcher ───────────────────────────────────────────────────────────
function AccountSwitcher({
  userEmail,
  accounts,
  onSwitch,
  onSignOut,
}: {
  userEmail: string
  accounts: Account[]
  onSwitch: (email: string) => void
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const [addingAccount, setAddingAccount] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAddAccount = async () => {
    setAddingAccount(true)
    setOpen(false)
    try {
      const data: { email: string; accessToken: string; name?: string } =
        await initiateGoogleLogin() as { email: string; accessToken: string; name?: string }
      saveAccount({
        email:        data.email,
        name:         data.name || '',
        access_token: data.accessToken,
        persona:      localStorage.getItem('persona') || '',
      })
      setActiveEmail(data.email)
      onSwitch(data.email)
    } catch (err) {
      console.error('Add account failed:', err)
    } finally {
      setAddingAccount(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-1.5 transition"
        style={{ color: '#1B2A3B', background: open ? '#FAF8F5' : 'transparent', border: '1px solid #E8E4DF' }}
      >
        <span>{userEmail}</span>
        <span style={{ fontSize: '10px' }}>{open ? '▲' : '▾'}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-64 rounded-xl py-2 z-50"
          style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E8E4DF' }}
        >
          {accounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => { setOpen(false); if (acc.email !== userEmail) onSwitch(acc.email) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: acc.email === userEmail ? 'linear-gradient(135deg,#FF6B35,#FF8C42)' : '#CBD5E0' }}
              >
                {(acc.name || acc.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{acc.email}</p>
              </div>
              {acc.email === userEmail && (
                <span className="text-orange-500 text-xs font-bold">●</span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={handleAddAccount}
            disabled={addingAccount}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50"
          >
            <span className="text-gray-400 text-base">+</span>
            {addingAccount ? 'Connecting…' : 'Add account'}
          </button>

          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50 text-sm"
            style={{ color: '#EF4444' }}
          >
            Sign out of all accounts
          </button>
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()

  const persona = localStorage.getItem('persona')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail,        setUserEmail]       = useState('')
  const [authLoading,      setAuthLoading]     = useState(false)
  const [accounts,         setAccounts]        = useState<Account[]>([])

  const [paymentStatus,    setPaymentStatus]    = useState<PaymentStatus | null>(null)
  const [showPayModal,     setShowPayModal]     = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [addingAccount,    setAddingAccount]    = useState(false)
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false)

  const [emails,       setEmails]       = useState<Email[]>([])
  const [summary,      setSummary]      = useState<Summary | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError,   setFetchError]   = useState('')

  const [selected,      setSelected]      = useState<Set<string>>(new Set())
  const [filter,        setFilter]        = useState<Filter>('all')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const PERSONA_RULES: Record<string, string[]> = {
    startup_founder:      ['Mark investor and VC emails as Important', 'Archive mass marketing and newsletter digests', 'Label cold sales pitches as Promotions'],
    working_professional: ['Prioritize emails from your company domain', 'Archive promotional and coupon emails', 'Archive weekend newsletters automatically'],
    student:              ['Mark university and professor emails as Important', 'Archive alumni and event announcement emails', 'Label job boards and internship spam as Promotions'],
    freelancer:           ['Mark client and contract-related emails as Important', 'Archive SaaS tool billing and update digests', 'Label brand partnership cold outreach as Promotions'],
  }

  const seedRules = (): Rule[] =>
    (persona ? PERSONA_RULES[persona] ?? [] : []).map((text, i) => ({
      id:      `seed_${i}`,
      text,
      enabled: true,
    }))

  const [rules, setRules] = useState<Rule[]>(seedRules)

  const loadRulesFromApi = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/rules?email=${encodeURIComponent(email)}`)
      if (!res.ok) return
      const { rules: apiRules } = await res.json()
      if (Array.isArray(apiRules) && apiRules.length > 0) {
        setRules(apiRules)
      } else {
        // First login — seed persona rules and persist them immediately
        const seeded = seedRules()
        setRules(seeded)
        saveRulesToApi(email, seeded)
      }
    } catch { /* keep seeded rules on network error */ }
  }

  const saveRulesToApi = async (email: string, rulesToSave: Rule[]) => {
    if (!email) return
    try {
      await fetch(`${API_URL}/api/users/rules`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, rules: rulesToSave }),
      })
    } catch { /* non-fatal */ }
  }

  const fetchPaymentStatus = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/payment/status?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data: PaymentStatus = await res.json()
        setPaymentStatus(data)
        // Auto-show payment modal if expired and ?pay=1 is in URL
        if (data.status === 'expired' || params.get('pay') === '1') {
          setShowPayModal(true)
        }
      }
    } catch { /* non-fatal */ }
  }

  useEffect(() => {
    const token = getAccessToken()
    const email = getUserEmail()
    if (token && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
      setAccounts(getAccounts())
      fetchPaymentStatus(email)
      loadRulesFromApi(email)
    }
  }, [])

  const handleGmailConnect = async () => {
    setAuthLoading(true)
    try {
      const data: { email: string; name?: string; accessToken: string } =
        await initiateGoogleLogin() as { email: string; name?: string; accessToken: string }
      saveAccount({
        email:        data.email,
        name:         data.name || '',
        access_token: data.accessToken,
        persona:      persona || '',
      })
      setActiveEmail(data.email)
      setIsAuthenticated(true)
      setUserEmail(data.email)
      setAccounts(getAccounts())
      fetchPaymentStatus(data.email)
    } catch (error) {
      console.error('OAuth failed:', error)
      alert('Failed to connect Gmail. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    setUserEmail('')
    setEmails([])
    setSummary(null)
    setSelected(new Set())
    setShowSignOutModal(false)
    navigate('/login')
  }

  const handleAddAccountFromModal = async () => {
    setAddingAccount(true)
    setShowSignOutModal(false)
    try {
      const data: { email: string; accessToken: string; name?: string } =
        await initiateGoogleLogin() as { email: string; accessToken: string; name?: string }
      saveAccount({ email: data.email, name: data.name || '', access_token: data.accessToken, persona: persona || '' })
      setActiveEmail(data.email)
      setUserEmail(data.email)
      setAccounts(getAccounts())
      fetchPaymentStatus(data.email)
    } catch (err) {
      console.error('Add account failed:', err)
    } finally {
      setAddingAccount(false)
    }
  }

  const handleSwitchAccount = async (email: string) => {
    setActiveEmail(email)
    // Try to restore session for this account
    const refreshed = await restoreSession()
    if (refreshed) {
      setUserEmail(refreshed.email)
      setAccounts(getAccounts())
      setEmails([])
      setSummary(null)
      setSelected(new Set())
      fetchPaymentStatus(refreshed.email)
    }
  }

  const fetchAndScoreEmails = async () => {
    const token = getAccessToken()
    if (!token) return
    setFetchLoading(true)
    setFetchError('')
    setActionMessage('')
    try {
      const gmailRes = await fetch(`${API_URL}/api/gmail/messages?windowHours=24&maxResults=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!gmailRes.ok) throw new Error('Failed to fetch emails')
      const { emails: rawEmails } = await gmailRes.json()

      const scoreRes = await fetch(`${API_URL}/api/claude/score`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ emails: rawEmails, userEmail, accessToken: token }),
      })
      if (!scoreRes.ok) throw new Error('Failed to score emails')
      const { emails: scoredEmails, summary: scoreSummary } = await scoreRes.json()

      setEmails(scoredEmails)
      setSummary(scoreSummary)
      setSelected(new Set())
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setFetchLoading(false)
    }
  }

  const applyAction = async (action: 'archive' | 'label_promo' | 'label_important') => {
    if (selected.size === 0) return
    const token = getAccessToken()
    if (!token) return
    setActionLoading(true)
    setActionMessage('')
    try {
      const senders = emails
        .filter((e) => selected.has(e.id))
        .map((e) => ({ id: e.id, from: e.from }))

      const res = await fetch(`${API_URL}/api/labels/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ messageIds: Array.from(selected), action, userEmail, senders }),
      })
      if (!res.ok) throw new Error('Action failed')
      const actionLabels: Record<string, string> = {
        archive:         'archived',
        label_promo:     'labelled as Promotions',
        label_important: 'labelled as Important',
      }
      setActionMessage(`✅ ${selected.size} emails ${actionLabels[action]}!`)
      if (action === 'archive') {
        setEmails((prev) => prev.filter((e) => !selected.has(e.id)))
        setSelected(new Set())
      }
    } catch (err: unknown) {
      setActionMessage(`❌ ${err instanceof Error ? err.message : 'Action failed'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredEmails = emails.filter((e) => {
    if (filter === 'trash')     return e.trashiness_score >= 7
    if (filter === 'medium')    return e.trashiness_score >= 4 && e.trashiness_score < 7
    if (filter === 'important') return e.trashiness_score <= 3
    return true
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filteredEmails.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredEmails.map((e) => e.id)))
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 7) return 'bg-red-100 text-red-700'
    if (score >= 4) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const scoreLabel = (score: number) => {
    if (score >= 7) return '🗑️ Trash'
    if (score >= 4) return '😐 Meh'
    return '⭐ Keep'
  }

  const formatFrom = (from: string) => {
    const match = from.match(/^"?([^"<]+)"?\s*</)
    return match ? match[1].trim() : from.split('@')[0]
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)', color: '#fff' }}
          >
            ✨ Premium Activated
          </div>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Gmail Account</h1>
          <p className="text-gray-600 mb-8">
            Connect Gmail to start using your custom rules and behavioral AI.
          </p>
          <button
            onClick={handleGmailConnect}
            disabled={authLoading}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {authLoading ? 'Connecting…' : 'Connect Gmail Account'}
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
            <span>⚡ Unlimited emails</span>
            <span>🔒 OAuth only — we never see your password</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Authenticated ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Sign out confirmation modal */}
      {showSignOutModal && (
        <SignOutModal
          onConfirm={handleSignOut}
          onAddAccount={handleAddAccountFromModal}
          onCancel={() => setShowSignOutModal(false)}
          addingAccount={addingAccount}
        />
      )}

      {/* Payment modal for expired trial */}
      {showPayModal && paymentStatus?.status === 'expired' && (
        <PaymentModal
          email={userEmail}
          onSuccess={() => { setShowPayModal(false); window.location.reload() }}
        />
      )}

      {/* Payment modal for "Activate Premium" click */}
      {showPayModal && paymentStatus?.status === 'trial' && (
        <PaymentModal
          email={userEmail}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => { setShowPayModal(false); window.location.reload() }}
        />
      )}

      {/* Mobile sidebar overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile top header */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-gray-900">📬 Inbox Purge Pro</h1>
          {paymentStatus?.status === 'active' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}>✨</span>
          )}
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg"
          style={{ background: '#FAF8F5', border: '1px solid #E8E4DF' }}
          aria-label="Open rules sidebar"
        >
          <span className="block w-5 h-0.5 rounded-full bg-gray-700" />
          <span className="block w-5 h-0.5 rounded-full bg-gray-700" />
          <span className="block w-5 h-0.5 rounded-full bg-gray-700" />
        </button>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-5">

        {/* Desktop top bar */}
        <div className="hidden md:flex bg-white rounded-xl shadow-sm p-5 justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">📬 Inbox Purge Pro</h1>
            {paymentStatus?.status === 'active' && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#FF6B35,#FF8C42)' }}
              >
                ✨ Premium
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {accounts.length > 1 ? (
              <AccountSwitcher
                userEmail={userEmail}
                accounts={accounts}
                onSwitch={handleSwitchAccount}
                onSignOut={() => setShowSignOutModal(true)}
              />
            ) : (
              <span className="text-sm text-gray-500">{userEmail}</span>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            {accounts.length <= 1 && (
              <button onClick={() => setShowSignOutModal(true)} className="text-sm text-gray-500 hover:text-gray-800 transition">
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Trial banner */}
        {paymentStatus?.status === 'trial' && (
          <TrialBanner
            daysRemaining={paymentStatus.daysRemaining}
            onActivate={() => setShowPayModal(true)}
          />
        )}

        {/* Main layout: sidebar + content */}
        <div className="flex gap-5 items-start">

          {/* Premium sidebar — fixed overlay on mobile, inline on desktop */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-80 md:relative md:inset-auto md:z-auto md:w-auto
            transition-transform duration-300 md:transition-none
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile close button inside sidebar header area — injected via wrapper */}
            <div className="md:hidden absolute top-3 right-3 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white/80 hover:text-white text-lg leading-none"
                style={{ background: 'rgba(0,0,0,0.15)' }}
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>
            <PremiumSidebar
              persona={persona}
              rules={rules}
              accessToken={getAccessToken()}
              userEmail={userEmail}
              onAddRule={(text) => {
                const next = [...rules, { id: `rule_${Date.now()}`, text, enabled: true }]
                setRules(next)
                saveRulesToApi(userEmail, next)
              }}
              onToggleRule={(id) => {
                const next = rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r)
                setRules(next)
                saveRulesToApi(userEmail, next)
              }}
              onDeleteRule={(id) => {
                const next = rules.filter((r) => r.id !== id)
                setRules(next)
                saveRulesToApi(userEmail, next)
              }}
              onAddPrebuiltRule={(rule) => {
                const next = [...rules, rule]
                setRules(next)
                saveRulesToApi(userEmail, next)
              }}
              onBulkUpdateRules={(next) => {
                setRules(next)
                saveRulesToApi(userEmail, next)
              }}
            />
          </div>

          {/* Email panel */}
          <div className="flex-1 min-w-0 space-y-5">
            {emails.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to purge your inbox?</h2>
                <p className="text-gray-500 mb-6">
                  We'll scan your emails and apply your custom rules.
                </p>
                <button
                  onClick={fetchAndScoreEmails}
                  disabled={fetchLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition disabled:opacity-50"
                >
                  {fetchLoading ? '⏳ Scanning…' : '🚀 Scan My Inbox'}
                </button>
                {fetchError && <p className="mt-4 text-red-500 text-sm">{fetchError}</p>}
              </div>
            ) : (
              <>
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Scanned', value: summary.total,     color: 'bg-gray-50',   text: 'text-gray-700'  },
                      { label: '🗑️ High Trash', value: summary.highTrash, color: 'bg-red-50',    text: 'text-red-600'   },
                      { label: '😐 Medium',     value: summary.medium,    color: 'bg-yellow-50', text: 'text-yellow-600'},
                      { label: '⭐ Important',  value: summary.important, color: 'bg-green-50',  text: 'text-green-600' },
                    ].map((card) => (
                      <div key={card.label} className={`${card.color} rounded-xl p-4 text-center`}>
                        <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">{selected.size} selected</span>
                  <button onClick={() => applyAction('archive')} disabled={actionLoading || selected.size === 0}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-40">
                    📦 Archive Selected
                  </button>
                  <button onClick={() => applyAction('label_promo')} disabled={actionLoading || selected.size === 0}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-40">
                    🏷️ Label: Promotions
                  </button>
                  <button onClick={() => applyAction('label_important')} disabled={actionLoading || selected.size === 0}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-40">
                    ⭐ Label: Important
                  </button>
                  <button onClick={fetchAndScoreEmails} disabled={fetchLoading}
                    className="ml-auto text-sm text-gray-500 hover:text-gray-800 transition disabled:opacity-40">
                    🔄 Rescan
                  </button>
                </div>
                {actionMessage && (
                  <p className="text-sm font-medium text-gray-700 px-1">{actionMessage}</p>
                )}

                <div className="flex gap-2">
                  {(['all', 'trash', 'medium', 'important'] as Filter[]).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                      {f === 'all' ? 'All' : f === 'trash' ? '🗑️ Trash' : f === 'medium' ? '😐 Medium' : '⭐ Important'}
                      <span className="ml-1.5 text-xs opacity-70">
                        {f === 'all' ? emails.length : f === 'trash' ? summary?.highTrash : f === 'medium' ? summary?.medium : summary?.important}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Desktop table header */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <input type="checkbox"
                      checked={selected.size === filteredEmails.length && filteredEmails.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-orange-500" />
                    <span>From</span>
                    <span>Subject</span>
                    <span>Score</span>
                    <span>Date</span>
                  </div>
                  {/* Mobile select-all */}
                  <div className="md:hidden px-4 py-2 border-b bg-gray-50 flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox"
                      checked={selected.size === filteredEmails.length && filteredEmails.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-orange-500" />
                    <span>Select all</span>
                  </div>
                  {filteredEmails.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No emails in this category.</p>
                  ) : (
                    filteredEmails.map((email) => (
                      <div key={email.id} onClick={() => toggleSelect(email.id)}
                        className={`border-b last:border-0 cursor-pointer transition hover:bg-gray-50 ${selected.has(email.id) ? 'bg-orange-50' : ''}`}>
                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3">
                          <input type="checkbox" checked={selected.has(email.id)} onChange={() => toggleSelect(email.id)}
                            onClick={(e) => e.stopPropagation()} className="w-4 h-4 accent-orange-500 mt-1" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{formatFrom(email.from)}</p>
                            <p className="text-xs text-gray-400 truncate">{email.snippet}</p>
                          </div>
                          <p className="text-sm text-gray-700 truncate self-center">{email.subject || '(no subject)'}</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full self-center whitespace-nowrap ${scoreColor(email.trashiness_score)}`}>
                            {email.trashiness_score}/10 {scoreLabel(email.trashiness_score)}
                          </span>
                          <p className="text-xs text-gray-400 self-center whitespace-nowrap">
                            {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {/* Mobile row */}
                        <div className="md:hidden flex items-start gap-3 px-4 py-3">
                          <input type="checkbox" checked={selected.has(email.id)} onChange={() => toggleSelect(email.id)}
                            onClick={(e) => e.stopPropagation()} className="w-4 h-4 accent-orange-500 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{formatFrom(email.from)}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${scoreColor(email.trashiness_score)}`}>
                                {scoreLabel(email.trashiness_score)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 truncate mt-0.5">{email.subject || '(no subject)'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
