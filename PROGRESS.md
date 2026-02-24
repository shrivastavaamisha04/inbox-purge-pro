# Inbox Purge Pro — Build Progress

## Project Structure
- **Frontend:** `~/Desktop/inbox-purge-pro` (React + TypeScript + Vite, port 5174)
- **Backend:** `~/Desktop/inbox-purge-api` (Express + SQLite + Node.js, port 3000)

## How to Start
```bash
# Terminal 1 — API
cd ~/Desktop/inbox-purge-api && npm run dev

# Terminal 2 — Frontend
cd ~/Desktop/inbox-purge-pro && npm run dev
```

---

## What's Been Built

### Product Model
- **One tier: Premium only** — 14-day free trial, no card required, ₹89/month after
- **No free tier** — all free-tier references removed from landing page

---

### Backend (`inbox-purge-api/`)

#### `db.js`
- Added 7 new columns (additive migration via PRAGMA table_info):
  - `subscription_status` (trial/active/expired)
  - `trial_start_date`, `trial_end_date`, `paid_until`
  - `razorpay_payment_id`
  - `name` (Google display name)
  - `welcome_sent` (prevents duplicate welcome emails)

#### `routes/auth.js`
- `saveUserToDb(email, refreshToken, name)` — saves name + sets trial dates on first insert
- Added `GET /api/auth/refresh?email=` — silent session restore using stored refresh_token

#### `routes/payment.js` (new)
- `GET /api/payment/status?email=` — returns trial/active/expired + daysRemaining
- `POST /api/payment/create-order` — creates Razorpay order (₹89 = 8900 paise)
- `POST /api/payment/verify` — HMAC-SHA256 signature verification, activates subscription

#### `routes/admin.js` (new)
- Protected by `X-Admin-Key` header
- `GET /api/admin/stats` — user counts, MRR, conversion rate
- `GET /api/admin/users` — all users table
- `GET /api/admin/recent-payments`

#### `routes/users.js`
- `sendWelcomeEmail()` — sends branded welcome email on first persona save
  - Subject uses MIME encoded-word for emoji: `=?UTF-8?B?...?=`
  - Shows actual scan time + digest time (30 min after scan) from user's DB record
  - Guarded by `welcome_sent = 0` to prevent duplicates
- `POST /api/users/settings` accepts `persona` + `accessToken`, triggers welcome email
- Rules stored as JSON in DB via `GET/POST /api/users/rules`

#### `routes/gmail.js`
- Added `windowHours` query param → `after:UNIX_TIMESTAMP` Gmail search
- Cap: maxResults 200
- `POST /api/gmail/preview-rule` — returns up to 10 real inbox emails matching a gmailQuery (kept, used internally by old flow)

#### `routes/claude.js`
- **Scoring** (`POST /api/claude/score`) — Claude Haiku, per-email trashiness 1–10:
  - Score 1-2: transfer alerts, OTP, invoices, security alerts, calendar invites
  - Score 8-10: marketing newsletters, bank promos, cashback offers
  - Self-sent emails (from == userEmail) → always score 1, skip Claude
  - Behavioral context injected from `actions` table (top archived/important senders)
  - Now accepts `accessToken` — triggers background prebuilt label application to Gmail after scoring
  - `applyPrebuiltLabels(accessToken, userEmail, scoredEmails)` — fire-and-forget, mirrors scheduler labeling so dashboard scans also tag Gmail
- **`POST /api/claude/build-rule`** — agentic rule builder (current, active):
  - Model: **claude-sonnet-4-6** (not haiku)
  - Tool-use loop with `search_inbox(query)` tool that hits Gmail API live
  - Claude iterates: generate query → test on real inbox → inspect results → refine → repeat
  - **No hard-coded heuristics** — Claude reasons empirically from real email data
  - Behavioral context injected (top archived/important senders as sanity check)
  - Returns: `{ description, label, gmailQuery, action, priorityConditions, previewEmails, previewTotal, searches, verificationNote }`
  - Max 6 iterations; gracefully degrades if no access token (reasons from description only)
  - `googleapis` imported directly in claude.js for the search tool
- **`POST /api/claude/parse-rule`** (legacy, kept) — single-shot haiku, hard-coded banking/newsletter heuristics; no longer called from frontend
- **`POST /api/claude/refine-rule`** (legacy, kept) — single-shot post-hoc refinement; no longer called from frontend

#### `routes/applyRule.js`
- `POST /api/gmail/apply-rule` — finds/creates Gmail label, applies to matching emails, optionally marks important
- `POST /api/gmail/remove-label` — strips a label from ALL emails that have it (undo bad apply)

#### `scheduler.js`
- `runParseJob` — scans inbox per user's `parse_window_hours` setting
- `runDigestJob` — sends daily digest email
- **Digest timing: 30 minutes after parse** (not hardcoded 7 PM)
  - `buildDigestCronExpression(parseTime)` adds 30 min with hour rollover
- `runTrialReminderJob` — Day 13 + Day 14 trial reminder emails at 9 AM IST
- Trial reminder emails sent via user's own Gmail OAuth token
- Fixed `[Claude] single email failed: No JSON in response` — added assistant prefill `{` to force JSON output, increased `max_tokens` 100 → 150, truncated snippet to 200 chars

#### `prebuilt-matcher.js`
- **Fixed false positive matching** — critical bug where `from:` and `subject:` keywords were combined into one haystack, causing e.g. Calendly to match banking rules because its subject contained "upgrade"
- New logic: parses `gmailQuery` into `from:(...)` and `subject:(...)` segments; when both exist, **both must match their respective fields** (AND logic)
- `fragmentMatches(fragment, text)` — checks quoted phrases + bare words against a single field
- Bumped bare-word minimum 3 → 4 chars to reduce noise from short tokens

#### `server.js`
- Body limit: `express.json({ limit: '10mb' })`
- CORS allows `X-Admin-Key` header
- Routes: auth, gmail, score, claude, labels, applyRule, users, payment, admin

#### `.env`
```
RAZORPAY_KEY_ID=rzp_test_SJWfqVvAJgi2MV
RAZORPAY_KEY_SECRET=hl39Iov98Gskb818YRQgccgm
ADMIN_SECRET_KEY=bh12159-a20436
DASHBOARD_URL=http://localhost:5174/dashboard
```

---

### Frontend (`inbox-purge-pro/src/`)

#### `utils/session.ts` (new)
- Multi-account localStorage manager
- `getAccounts()`, `saveAccount()`, `removeAccount()`
- `getActiveEmail()`, `setActiveEmail()`, `getActiveAccount()`
- `restoreSession()` — calls `/api/auth/refresh`, updates localStorage, enables auto-login

#### `App.tsx`
- Session restore on mount → auto-navigate to `/dashboard` if session valid
- Removed WaitlistModal — all CTAs → `/onboarding`
- Routes: `/`, `/dashboard`, `/onboarding`, `/settings`, `/login`, `/admin`

#### `components/auth/LoginPage.tsx` (new)
- Account picker for returning users
- Silent refresh → OAuth fallback
- "Add another account" button

#### `components/premium/PersonaSelection.tsx`
- 3-step onboarding wizard (Progress dots: ● ○ ○)
  - Step 1: Persona selection (4 cards)
  - Step 2: Connect Gmail (OAuth)
  - Step 3: "You're all set" — 14-day trial confirmed, feature checklist
- Fixed layout for laptop screens (overflow-y-auto, reduced padding)

#### `components/dashboard/Dashboard.tsx`
- **Rules persistence** — loads from `GET /api/users/rules` on mount, saves on every add/toggle/delete
- **Sign-out modal** — confirmation popup with "Add another account instead" option
- **Trial banner** — shows days remaining, "Activate Premium" button
- **Payment modal** — Razorpay checkout.js loaded dynamically
- **Account switcher** dropdown (multi-account support)
- **Settings link** — visible "⚙ Settings" text button in header
- **Undo label button** — "↩ Undo label" on each rule, calls `POST /api/gmail/remove-label`
  - Label name extracted from rule text using "as [Label]" pattern
- **Agentic rule test flow** — single `POST /api/claude/build-rule` call (replaces old 4-step waterfall):
  - Passes `{ rule, accessToken, userEmail }` — backend handles everything
  - Loading label: "🔍 Analyzing…"
  - Preview emails come from the last search the agent ran (empirically verified)
  - Shows "✅ Verified on your inbox: [verificationNote]" from the agent's own assessment
- **`PremiumSidebar`** receives `userEmail` as a prop (needed for build-rule behavioral context)
- Self-emails always score 1 (never shown as trash)
- Email scan: `windowHours=24&maxResults=200`
- **Rule Library card** — redesigned entry point; orange gradient card with description + "Browse →" button, placed immediately after sidebar header (above rules list); shows "✓ N library rules active" when prebuilt rules are enabled
- **Enable All toggle** — sticky bar in Rule Library slide-over between header and domain list; toggles all prebuilt rules on/off in one tap; uses `onBulkUpdateRules` prop
- **Rule Library panel height fix** — changed `absolute inset-0` → `absolute inset-x-0 top-0 max-h-full` so panel shrinks to content height instead of always filling the full sidebar
- **Rules filter pills** — horizontal scrollable domain filter tabs above rules list (All / ✏️ Custom / Banking / Travel / etc.); only renders when there's a mix of domains to filter; uses `ruleFilter` state + derived `filteredRules`
- **Filter pill border fix** — `py-1` on pill container prevents `overflow-x-auto` from clipping the active pill's border
- **Dashboard scan applies Gmail labels** — passes `accessToken` to `/api/claude/score`; backend applies prebuilt labels in background after scoring

#### `components/settings/Settings.tsx`
- Shows digest time as parse time + 30 min (dynamic, not hardcoded 7 PM)
- Parse window options: 12h / 18h / 24h / 48h

#### `components/admin/AdminDashboard.tsx` (new)
- Password-gated (`VITE_ADMIN_EMAIL` env var)
- Stat cards: total/trial/active/expired users, MRR, conversion rate
- Users table with status badges

#### Landing page copy updates
- `HeroSection.tsx` — "Start Free — 14 Days Free"; pill changed from "🚀 Launching in 2 Days!" → "✨ BETA version live"
- `PricingSection.tsx` — single premium card, no free tier, "14 days free · ₹89/month after"
- `CTASection.tsx` — single CTA, removed free tier button
- `CustomRulesSection.tsx` — "Try Free — 14 Days"
- `HowAIWorksSection.tsx` — "Four Ways Inbox Purge Gets Smarter" (was Three); 4th card "Starts Smart from Day One" (55 pre-built rules); grid `md:grid-cols-2 lg:grid-cols-4`; cards use `flex flex-col` + `flex-1` on description so bottom stats align across all 4 cards

#### `.env`
```
VITE_RAZORPAY_KEY_ID=rzp_test_SJWfqVvAJgi2MV
VITE_ADMIN_EMAIL=amishashrivastavaa@gmail.com
```

---

## Intelligence Architecture

### Rule Building — Agentic Loop (`/api/claude/build-rule`)
The rule builder is a **tool-use agent**, not a single-shot prompt. Flow:
1. User types a plain-English rule
2. Frontend sends `{ rule, accessToken, userEmail }` to `/api/claude/build-rule`
3. Agent (claude-sonnet-4-6) forms a candidate Gmail query
4. Agent calls `search_inbox(query)` → real Gmail API call → returns email samples
5. Agent inspects results: "Does each email genuinely match the rule's intent?"
6. If false positives found → narrows query → searches again (up to 6 iterations)
7. Returns final verified rule + the preview emails from the last search

No hard-coded heuristics for banking, newsletters, etc. Claude reasons empirically from the user's actual inbox data. Works correctly for any rule type a user might write.

### Email Scoring (`/api/claude/score`)
- Claude Haiku 4.5 — fast, per-email, batched in groups of 5
- Explicit scoring rules (transfer alerts = 1, marketing = 8–10)
- Personalised via `actions` table: top 15 senders user always archives or marks important are injected as behavioral context

---

## Current Status
- ✅ Onboarding flow (3-step wizard)
- ✅ Gmail OAuth + persistent sessions
- ✅ AI email scoring (Claude Haiku, behaviorally personalised)
- ✅ **Agentic rule builder** (claude-sonnet-4-6, tool-use, empirically verified on real inbox)
- ✅ Trial system (14-day, DB-tracked)
- ✅ Razorpay payment integration (needs live keys for production)
- ✅ Daily digest emails (30 min after scan)
- ✅ Trial reminder emails (Day 13 + Day 14)
- ✅ Welcome email on first persona save
- ✅ Admin dashboard
- ✅ Multi-account support
- ✅ Rule persistence (saved to DB, not just localStorage)
- ✅ Undo label feature
- ✅ Sign-out confirmation modal
- ✅ **Pre-built Rule Library** (55 rules, 12 domains, Enable All toggle)
- ✅ **Rule Library card** in sidebar (redesigned entry point with active rule count)
- ✅ **Domain filter pills** on rules list (All / Custom / Banking / Travel / …)
- ✅ **Dashboard scan applies Gmail labels** (same behaviour as scheduled scan)
- ✅ **Prebuilt matcher false positive fix** (from: AND subject: enforced separately)
- ✅ **Claude scoring JSON fix** (assistant prefill forces valid JSON output)
- ✅ Landing — "BETA version live" pill, Four Ways section, aligned card bottoms
- ⏳ Custom domain + email sending (currently sends from user's own Gmail)

---

## 🚀 Deployment Checklist

### Backend env vars (production)
```
DASHBOARD_URL=https://your-domain.com/dashboard
API_URL=https://your-api-domain.com
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
ANTHROPIC_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-api-domain.com/api/auth/callback
ADMIN_SECRET_KEY=...  ← change from dev value
```

### Frontend env vars (production)
```
VITE_API_URL=https://your-api-domain.com
VITE_RAZORPAY_KEY_ID=rzp_live_...
VITE_ADMIN_EMAIL=amishashrivastavaa@gmail.com
```

### Your checklist before going live

#### Razorpay — test → live
- [ ] Switch Razorpay dashboard to **Live mode**, copy Live Key ID + Secret
- [ ] Update both `.env` files above
- [ ] (Optional) Set webhook URL in Razorpay: `https://your-api-domain.com/api/payment/verify`

#### Google OAuth — allow production domain
- [ ] Google Cloud Console → Credentials → edit OAuth 2.0 Client
- [ ] Add production frontend URL to **Authorised JavaScript origins**
- [ ] Add `https://your-api-domain.com/api/auth/callback` to **Authorised redirect URIs**
- [ ] If OAuth consent screen is still in **Testing** mode: either **publish** it (needs Google verification for Gmail scopes — takes a few days) OR add all beta users as **Test users** manually in the console

#### Database
- [ ] Confirm SQLite DB file is on **persistent disk** on your host (not ephemeral — Render free tier wipes on sleep)
- [ ] OR migrate to a managed DB (Postgres / Turso) if using a platform that doesn't persist disk

#### Deploy
- [ ] Backend: deploy to Railway / Render / Fly.io — run `node server.js` (not `npm run dev`)
- [ ] Frontend: deploy to Vercel / Netlify — set all `VITE_*` env vars in the platform dashboard
- [ ] Smoke-test full flow: landing → onboarding → Gmail connect → scan → rule add → Razorpay payment

#### Post-launch
- [ ] Check `GET /api/admin/stats` (with `X-Admin-Key` header) — watch signups + conversion
- [ ] Verify scheduler is running: look for `[scheduler] Parse complete` in server logs
- [ ] Share the link 🎉
