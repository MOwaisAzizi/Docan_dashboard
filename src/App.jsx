import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8000/api/v1'
const icons = { dashboard: '⌘', users: '♙', offers: '◈', orders: '▣', items: '◇', shops: '⌂' }
const labels = {
  pending_buyer_confirmation: 'Pending buyer confirmation',
  change_requested: 'Change requested',
  under_review: 'Under review',
}
const title = (x) =>
  x?.translation?.en?.title || x?.translation?.fa?.title || x?.translation?.ps?.title || 'Untitled'
const person = (x) => x?.fullname || '—'
const money = (x) =>
  `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(x || 0)} AF`
const date = (x) =>
  x ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(x)) : '—'
const statusName = (x) => labels[x] || x?.replaceAll('_', ' ') || '—'
function useDebounce(value) {
  const [out, setOut] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setOut(value), 350)
    return () => clearTimeout(t)
  }, [value])
  return out
}
function StatusBadge({ value }) {
  return <span className={`badge ${value}`}>{statusName(value)}</span>
}
function SearchInput({ value, onChange }) {
  return (
    <label className="search">
      <span>⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search records…"
      />
    </label>
  )
}

function Pagination({ page, pages, total, onChange }) {
  return total ? (
    <div className="pagination">
      <span>
        {total} result{total !== 1 && 's'}
      </span>

      <div>
        <button className="text-black" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ‹
        </button>

        <b>
          {page} / {pages || 1}
        </b>

        <button className="text-black" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          ›
        </button>
      </div>
    </div>
  ) : null
}

function ConfirmDialog({ item, onClose, onConfirm }) {
  const [status, setStatus] = useState(item.status)
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close" onClick={onClose}>
          ×
        </button>
        <span className="modal-icon">!</span>
        <h2>Confirm status change</h2>
        <p>You’re updating this {item.kind}. This is applied immediately.</p>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {item.options.map((x) => (
            <option key={x} value={x}>
              {statusName(x)}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={() => onConfirm(status)}>
            Update status
          </button>
        </div>
      </div>
    </div>
  )
}
function Toast({ toast }) {
  return toast && <div className={`toast ${toast.type}`}>{toast.message}</div>
}

function LoginPage({ onLogin, toast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await onLogin(email.trim(), password)
    } catch (error) {
      toast({ type: 'error', message: error.message || 'Invalid email or password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <a className="login-brand" href="#/login">
          <span>✦</span> Naw-O-Kahna<em>.</em>
        </a>
        <p className="eyebrow">ADMIN WORKSPACE</p>
        <h1>Welcome back.</h1>
        <p className="login-copy">Sign in to manage your marketplace.</p>
        <form onSubmit={submit} noValidate>
          <label className={errors.email ? 'invalid' : ''}>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <small>{errors.email}</small>}
          </label>
          <label className={errors.password ? 'invalid' : ''}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <small>{errors.password}</small>}
          </label>
          <button className="primary login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            <span>→</span>
          </button>
        </form>
        <p className="login-footer">
          Naw-O-Kahna Marketplace <span>·</span> Platform control
        </p>
      </div>
    </div>
  )
}

const config = {
  users: {
    label: 'Users',
    description: 'Manage marketplace members and access levels.',
    tabs: [],
    columns: ['Member', 'Contact', 'Role', 'Joined', 'Action'],
    options: ['user', 'admin'],
  },
  offers: {
    label: 'Offers',
    description: 'Review and manage buyer offers.',
    tabs: ['all', 'pending', 'accepted', 'rejected', 'cancelled'],
    columns: ['Item', 'Buyer', 'Seller', 'Prices', 'Status', 'Created', 'Action'],
    options: ['pending', 'accepted', 'rejected', 'cancelled'],
  },
  orders: {
    label: 'Orders',
    description: 'Track marketplace orders and meetups.',
    tabs: [
      'all',
      'pending',
      'pending_buyer_confirmation',
      'confirmed',
      'change_requested',
      'accepted',
      'completed',
      'rejected',
      'cancelled',
    ],
    columns: ['Order', 'Parties', 'Total', 'Meetup', 'Status', 'Created', 'Action'],
    options: [
      'pending',
      'pending_buyer_confirmation',
      'confirmed',
      'change_requested',
      'accepted',
      'completed',
      'rejected',
      'cancelled',
    ],
  },
  items: {
    label: 'Items',
    description: 'Review listings using their current availability status.',
    tabs: ['all', 'available', 'reserved', 'sold'],
    columns: ['Item', 'Seller / Shop', 'Price', 'Status', 'Created', 'Action'],
    options: ['available', 'reserved', 'sold'],
  },
  shops: {
    label: 'Shops',
    description: 'Review business profiles and their current workflow state.',
    tabs: ['all', 'pending', 'under_review', 'accepted', 'closed'],
    columns: ['Shop', 'Owner', 'Contact', 'Status', 'Created', 'Action'],
    options: ['pending', 'under_review', 'accepted', 'closed'],
  },
}
function DataTable({ type, rows, onManage }) {
  const cells = (r) => {
    if (type === 'users')
      return [
        <strong>{r.fullname}</strong>,
        <>
          <span>{r.email}</span>
          <small>{r.phone?.join(', ') || 'No phone'}</small>
        </>,
        <StatusBadge value={r.role} />,
        date(r.createdAt),
      ]
    if (type === 'offers')
      return [
        <strong>{title(r.item)}</strong>,
        person(r.buyer),
        person(r.seller),
        <>
          <strong>{money(r.offeredPrice ?? r.askingPrice)}</strong>
          <small>Asked {money(r.askingPrice)}</small>
        </>,
        <StatusBadge value={r.status} />,
        date(r.createdAt),
      ]
    if (type === 'orders')
      return [
        <>
          <code>#{r._id.slice(-7)}</code>
          <small>{title(r.item)}</small>
        </>,
        <>
          <strong>{person(r.buyer)}</strong>
          <small>Seller: {person(r.seller)}</small>
        </>,
        <>
          <strong>{money(r.total)}</strong>
          <small>Subtotal {money(r.subtotal)}</small>
        </>,
        r.meetupLocation || r.location?.label || 'Not arranged',
        <StatusBadge value={r.status} />,
        date(r.createdAt),
      ]
    if (type === 'items')
      return [
        <div className="entity">
          <span className="thumb">
            {r.media?.[0]?.url ? <img src={r.media[0].url} alt="" /> : '◇'}
          </span>
          <strong>{title(r)}</strong>
        </div>,
        <>
          <strong>{person(r.owner)}</strong>
          <small>{title(r.shop)}</small>
        </>,
        money(r.price),
        <StatusBadge value={r.status} />,
        date(r.createdAt),
      ]
    return [
      <strong>{title(r)}</strong>,
      person(r.owner),
      <>
        <strong>{r.email || '—'}</strong>
        <small>{r.phone?.join(', ')}</small>
      </>,
      <StatusBadge value={r.status} />,
      date(r.createdAt),
    ]
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {config[type].columns.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              {cells(r).map((x, i) => (
                <td key={i}>{x}</td>
              ))}
              <td>
                <button className="manage" onClick={() => onManage(r)}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default function App() {
  const [section, setSection] = useState(() =>
    location.pathname === '/login' ? 'login' : location.hash.replace('#/', '') || 'dashboard',
  )
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState('')
  const query = useDebounce(search)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const active = config[section]
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  // TEMPORARY: show the dashboard data in demo mode without requiring admin auth.
  const navigate = (x) => {
    location.hash = `/${x}`
    setSection(x)
    setMenu(false)
    setSearch('')
    setStatus('all')
    setPage(1)
  }
  useEffect(() => {
    const update = () => setSection(location.hash.replace('#/', '') || 'dashboard')
    addEventListener('hashchange', update)
    return () => removeEventListener('hashchange', update)
  }, [])
  const request = useCallback(
    async (path, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      }
      const res = await fetch(`${API}${path}`, { ...options, headers })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || 'Request failed')
      return body
    },
    [token],
  )
  const login = async (email, password) => {
    const res = await fetch(`${API}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.message || 'Invalid email or password.')
    const user =
      body.user ||
      body.data?.user ||
      body.data?.account ||
      body.account ||
      (body.data?.role ? body.data : null)
    const accessToken = body.accessToken || body.token || body.data?.accessToken || body.data?.token
    if (user?.role !== 'admin') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      throw new Error('You are not authorized to access this dashboard.')
    }
    if (!accessToken) throw new Error('Login succeeded, but no authentication token was returned.')
    localStorage.setItem('accessToken', accessToken)
    location.hash = '#/dashboard'
  }
  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 20, search: query })
      if (status !== 'all') params.set('status', status)
      const body = await request(`/admin/${section}?${params}`)
      setRows(body.data[section] || [])
      setMeta(body.pagination || {})
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [active, page, query, request, section, status])
  useEffect(() => {
    if (section !== 'dashboard') load()
  }, [section, load])
  useEffect(() => setPage(1), [query, status])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])
  const change = async (value) => {
    try {
      await request(
        `/admin/${section}/${confirm.record._id}${section === 'users' ? '' : '/status'}`,
        {
          method: 'PATCH',
          body: JSON.stringify(section === 'users' ? { role: value } : { status: value }),
        },
      )
      setRows((old) =>
        old.map((x) =>
          x._id === confirm.record._id
            ? { ...x, [section === 'users' ? 'role' : 'status']: value }
            : x,
        ),
      )
      setConfirm(null)
      setToast({ type: 'success', message: `${active.label.slice(0, -1)} updated successfully.` })
    } catch (e) {
      setToast({ type: 'error', message: e.message })
    }
  }
  if (section === 'login')
    return (
      <>
        <LoginPage onLogin={login} toast={setToast} />
        <Toast toast={toast} />
      </>
    )
  const logout = async () => {
    try {
      await request('/user/logout', { method: 'POST' })
    } catch (error) {
      void error
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    location.assign('/')
  }
  const dashboard = (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">ADMIN OVERVIEW</p>
          <h1>
            Run your marketplace
            <br />
            <em>with clarity.</em>
          </h1>
          <p>Everything that needs your attention, in one calm command centre.</p>
          <button className="primary" onClick={() => navigate('offers')}>
            Review offers <span>→</span>
          </button>
        </div>
        <div className="orb">
          <span>Naw-O-Kahna</span>
          <b>ADMIN</b>
        </div>
      </div>
      <div className="quick-grid">
        {Object.entries(config).map(([key, x]) => (
          <button className="quick" key={key} onClick={() => navigate(key)}>
            <span>{icons[key]}</span>
            <div>
              <b>{x.label}</b>
              <small>{x.description}</small>
            </div>
            <i>→</i>
          </button>
        ))}
      </div>
    </>
  )
  return (
    <div className="app-shell">
      <aside className={menu ? 'open' : ''}>
        <a className="brand" href="#/dashboard">
          <span>✦</span> Naw-O-Kahna<em>.</em>
        </a>
        <p className="side-label">WORKSPACE</p>
        <nav>
          <button
            className={section === 'dashboard' ? 'active' : ''}
            onClick={() => navigate('dashboard')}
          >
            <i>{icons.dashboard}</i>Dashboard
          </button>
          {Object.entries(config)
            .filter(([k]) => k !== 'dashboard')
            .map(([k, x]) => (
              <button key={k} className={section === k ? 'active' : ''} onClick={() => navigate(k)}>
                <i>{icons[k]}</i>
                {x.label}
              </button>
            ))}
        </nav>
        <div className="side-bottom">
          <button onClick={logout}>
            <i>↗</i>Logout
          </button>
          <small>© 2026 Naw-O-Kahna Marketplace</small>
        </div>
      </aside>
      <main>
        <header>
          <button className="menu" onClick={() => setMenu(!menu)}>
            ☰
          </button>
          <div className="crumb">
            Workspace <span>/</span> {section === 'dashboard' ? 'Overview' : active?.label}
          </div>
          <div className="admin">
            <span>AR</span>
            <div>
              <b>Administrator</b>
              <small>Platform control</small>
            </div>
          </div>
        </header>
        <div className="content">
          {section === 'dashboard' ? (
            dashboard
          ) : (
            <>
              <div className="page-title">
                <div>
                  <p className="eyebrow">MARKETPLACE MANAGEMENT</p>
                  <h1>{active.label}</h1>
                  <p>{active.description}</p>
                </div>
                <button className="refresh" onClick={load}>
                  ↻ Refresh
                </button>
              </div>
              <div className="toolbar">
                <SearchInput value={search} onChange={setSearch} />
                {!!active.tabs.length && (
                  <div className="tabs">
                    {active.tabs.map((x) => (
                      <button
                        key={x}
                        className={status === x ? 'selected' : ''}
                        onClick={() => setStatus(x)}
                      >
                        {x === 'all' ? 'All' : statusName(x)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {error ? (
                <div className="state error">
                  <b>Couldn’t load {active.label.toLowerCase()}.</b>
                  <p>{error}</p>
                  <button className="primary" onClick={load}>
                    Try again
                  </button>
                </div>
              ) : loading ? (
                <div className="skeleton">
                  {[1, 2, 3, 4, 5].map((x) => (
                    <i key={x} />
                  ))}
                </div>
              ) : rows.length ? (
                <>
                  <DataTable
                    type={section}
                    rows={rows}
                    onManage={(record) =>
                      setConfirm({
                        record,
                        kind: active.label.slice(0, -1),
                        status: section === 'users' ? record.role : record.status,
                        options: active.options,
                      })
                    }
                  />
                  <Pagination
                    page={meta.page || page}
                    pages={meta.pages}
                    total={meta.total}
                    onChange={setPage}
                  />
                </>
              ) : (
                <div className="state">
                  <span>◇</span>
                  <h2>No records found</h2>
                  <p>Try a different search or status filter.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {confirm && (
        <ConfirmDialog item={confirm} onClose={() => setConfirm(null)} onConfirm={change} />
      )}
      <Toast toast={toast} />
    </div>
  )
}
