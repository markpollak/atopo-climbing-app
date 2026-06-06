import { useState, useEffect, useCallback } from 'react';
import { api, setAdminToken, getToken, type ApiUser, type AdminStats, type ApiRoute, type ApiCrag } from '../../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'dashboard' | 'users' | 'crags' | 'settings';

// ─── Shared styles / helpers ──────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--line)',
  borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)',
  letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5,
};
const errBox: React.CSSProperties = {
  fontSize: 13, color: 'var(--route-red)', background: '#fff0ef',
  border: '1px solid #f5ccc9', borderRadius: 8, padding: '8px 12px',
};
const okBox: React.CSSProperties = {
  fontSize: 13, color: '#2a7a4b', background: '#edfaf3',
  border: '1px solid #b6e8cc', borderRadius: 8, padding: '8px 12px',
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPanel({ onLogin }: { onLogin: (u: ApiUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.user.role !== 'admin') { setError('Admin access required.'); return; }
      setAdminToken(res.token);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '40px 36px', width: 380, boxShadow: '0 8px 32px rgba(35,38,36,0.10)' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: 'var(--rust)', marginBottom: 4 }}>atopo</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Admin panel</div>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 4 }}>Sign in with an admin account.</div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={label}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={input} /></div>
          <div><label style={label}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={input} /></div>
          {error && <div style={errBox}>{error}</div>}
          <button type="submit" disabled={loading} style={{ marginTop: 4, padding: '12px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const admin = role === 'admin';
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, background: admin ? 'var(--rust)' : 'var(--surface-2)', color: admin ? '#fff' : 'var(--ink-soft)', border: `1px solid ${admin ? 'var(--rust)' : 'var(--line)'}` }}>
      {role.toUpperCase()}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, [string, string]> = {
    pro:     ['#1a6b3c', '#d4f4e2'],
    free:    ['var(--ink-faint)', 'var(--surface-2)'],
    expired: ['#a84040', '#fde8e8'],
  };
  const [color, bg] = colors[tier] ?? colors.free;
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, background: bg, color, border: `1px solid ${color}22` }}>
      {tier.toUpperCase()}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: active ? '#2a7a4b' : 'var(--ink-faint)' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#46C07A' : 'var(--limestone)', display: 'inline-block' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(35,38,36,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 14, padding: '28px 28px 24px', width: 400, boxShadow: '0 12px 40px rgba(35,38,36,0.18)', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-faint)', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onDone }: { user: ApiUser; onClose: () => void; onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (pw !== confirm) { setError('Passwords do not match'); return; }
    if (pw.length < 8) { setError('Minimum 8 characters'); return; }
    setLoading(true);
    try {
      await api.auth.resetPassword(user.id, pw);
      onDone();
    } catch (err: any) {
      setError(err.message ?? 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <Modal title={`Reset password — ${user.name || user.email}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={label}>New password</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} required style={input} autoFocus /></div>
        <div><label style={label}>Confirm password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={input} /></div>
        {error && <div style={errBox}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--line)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--ink-soft)' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '9px 18px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Set password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SubscriptionModal({ user, onClose, onDone }: { user: ApiUser; onClose: () => void; onDone: (u: ApiUser) => void }) {
  const [tier, setTier]       = useState(user.subscription_tier);
  const [until, setUntil]     = useState(user.subscription_valid_until?.slice(0, 10) ?? '');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // When switching to pro, default to 1 month if no date set
  function handleTierChange(t: string) {
    setTier(t);
    if (t === 'pro' && !until) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setUntil(d.toISOString().slice(0, 10));
    }
    if (t === 'free') setUntil('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (tier === 'pro' && !until) { setError('Set an expiry date for pro access'); return; }
    setLoading(true);
    try {
      const updated = await api.auth.setSubscription(user.id, tier, until || null);
      onDone(updated);
    } catch (err: any) {
      setError(err.message ?? 'Failed');
    } finally { setLoading(false); }
  }

  const TIERS = [
    { value: 'free',    label: 'Free',    desc: 'No offline access' },
    { value: 'pro',     label: 'Pro',     desc: 'Full access + offline downloads' },
    { value: 'expired', label: 'Expired', desc: 'Was pro, now lapsed' },
  ];

  return (
    <Modal title={`Subscription — ${user.name || user.email}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={label}>Tier</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIERS.map(t => (
              <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${tier === t.value ? 'var(--rust)' : 'var(--line)'}`, background: tier === t.value ? 'rgba(200,107,60,0.06)' : 'var(--surface)' }}>
                <input type="radio" name="tier" value={t.value} checked={tier === t.value} onChange={() => handleTierChange(t.value)} style={{ accentColor: 'var(--rust)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {tier !== 'free' && (
          <div>
            <label style={label}>Valid until</label>
            <input type="date" value={until} onChange={e => setUntil(e.target.value)}
              style={{ ...input, width: 'auto' }} min={new Date().toISOString().slice(0, 10)} />
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 5 }}>
              After this date the app will prompt the user to renew.
            </div>
          </div>
        )}

        {error && <div style={errBox}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--line)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--ink-soft)' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '9px 18px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ user, onClose, onDone }: { user: ApiUser; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try { await api.auth.deleteUser(user.id); onDone(); }
    catch { setLoading(false); }
  }

  return (
    <Modal title="Delete user" onClose={onClose}>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
        Permanently delete <strong>{user.name || user.email}</strong>? This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--line)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--ink-soft)' }}>Cancel</button>
        <button onClick={confirm} disabled={loading} style={{ padding: '9px 18px', background: '#d93025', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => { api.auth.adminStats().then(setStats).catch(() => {}); }, []);

  function StatCard({ value, label, sub }: { value: number | string; label: string; sub?: string }) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 22px', flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--rust)' }}>{stats ? value : '—'}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>{sub}</div>}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px' }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard value={stats?.total_users ?? 0} label="Total users" />
        <StatCard value={stats?.active_users ?? 0} label="Active accounts" />
        <StatCard value={stats?.new_this_week ?? 0} label="New this week" />
        <StatCard value={stats?.new_this_month ?? 0} label="New this month" />
        <StatCard value={stats?.total_crags ?? 0} label="Crags" />
        <StatCard value={stats?.total_routes ?? 0} label="Routes" />
      </div>

      {stats?.tier_counts && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 14 }}>Subscription breakdown</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['free', 'pro', 'expired'].map(tier => (
              <div key={tier} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>{stats.tier_counts[tier] ?? 0}</div>
                <TierBadge tier={tier} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

function UsersSection({ currentAdmin }: { currentAdmin: ApiUser }) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetTarget, setResetTarget] = useState<ApiUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [subTarget, setSubTarget]       = useState<ApiUser | null>(null);
  const [toast, setToast] = useState('');

  const reload = useCallback(() => {
    setLoading(true);
    api.auth.adminUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function toggleRole(u: ApiUser) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    const updated = await api.auth.setRole(u.id, newRole);
    setUsers(us => us.map(x => x.id === updated.id ? updated : x));
    showToast(`${u.name || u.email} is now ${newRole}`);
  }

  async function toggleStatus(u: ApiUser) {
    const updated = await api.auth.setStatus(u.id, !u.is_active);
    setUsers(us => us.map(x => x.id === updated.id ? updated : x));
    showToast(updated.is_active ? `${u.name || u.email} activated` : `${u.name || u.email} deactivated`);
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, verticalAlign: 'middle' };

  function subLabel(u: ApiUser) {
    if (u.subscription_tier === 'free') return 'Free';
    const date = u.subscription_valid_until ? ` · ${formatDate(u.subscription_valid_until)}` : '';
    return `${u.subscription_tier.charAt(0).toUpperCase() + u.subscription_tier.slice(1)}${date}`;
  }

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--slate)', color: '#fff', padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, zIndex: 999, pointerEvents: 'none' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Users</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: '4px 0 0' }}>{users.length} registered</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…"
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, background: 'var(--card)', color: 'var(--ink)', width: 220, fontFamily: 'inherit' }} />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              {['Name', 'Email', 'Status', 'Role', 'Subscription', 'Last login', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ ...th, textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--ink-faint)', padding: 28 }}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--ink-faint)', padding: 28 }}>No users found.</td></tr>}
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none', opacity: u.is_active ? 1 : 0.55 }}>
                <td style={{ ...td, fontWeight: 600, color: 'var(--ink)' }}>{u.name || '—'}</td>
                <td style={{ ...td, color: 'var(--ink-soft)' }}>{u.email}</td>
                <td style={td}><StatusDot active={!!u.is_active} /></td>
                <td style={td}><RoleBadge role={u.role} /></td>
                <td style={td}>
                  <button onClick={() => setSubTarget(u)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    <TierBadge tier={u.subscription_tier} />
                    {u.subscription_valid_until && (
                      <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>· {formatDate(u.subscription_valid_until)}</span>
                    )}
                    <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>✎</span>
                  </button>
                </td>
                <td style={{ ...td, color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>{formatDateTime(u.last_login_at)}</td>
                <td style={{ ...td, color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>{formatDate(u.created_at)}</td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <ActionBtn onClick={() => toggleRole(u)} title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}>
                      {u.role === 'admin' ? '↓ User' : '↑ Admin'}
                    </ActionBtn>
                    <ActionBtn onClick={() => toggleStatus(u)} title={u.is_active ? 'Deactivate account' : 'Reactivate account'} disabled={u.id === currentAdmin.id}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </ActionBtn>
                    <ActionBtn onClick={() => setResetTarget(u)} title="Reset password">Reset pw</ActionBtn>
                    <ActionBtn onClick={() => setDeleteTarget(u)} title="Delete user" danger disabled={u.id === currentAdmin.id}>Delete</ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {subTarget && (
        <SubscriptionModal user={subTarget} onClose={() => setSubTarget(null)}
          onDone={updated => { setUsers(us => us.map(x => x.id === updated.id ? updated : x)); setSubTarget(null); showToast('Subscription updated'); }} />
      )}
      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} onDone={() => { setResetTarget(null); showToast('Password reset'); }} />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={() => { setDeleteTarget(null); reload(); showToast('User deleted'); }} />
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, title, danger, disabled }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: disabled ? 'default' : 'pointer', border: '1px solid var(--line)', background: danger ? '#fff0ef' : 'var(--surface)', color: danger ? '#c0392b' : 'var(--ink-soft)', opacity: disabled ? 0.35 : 1, fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function Settings() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (next !== confirm) { setError('New passwords do not match'); return; }
    if (next.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.auth.changePassword(current, next);
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err.message ?? 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px' }}>Settings</h1>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px', maxWidth: 420 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 18 }}>Change your password</div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={label}>Current password</label><input type="password" value={current} onChange={e => setCurrent(e.target.value)} required style={input} /></div>
          <div><label style={label}>New password</label><input type="password" value={next} onChange={e => setNext(e.target.value)} required style={input} /></div>
          <div><label style={label}>Confirm new password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={input} /></div>
          {error && <div style={errBox}>{error}</div>}
          {success && <div style={okBox}>Password updated successfully.</div>}
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, alignSelf: 'flex-start' }}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Crags ────────────────────────────────────────────────────────────────────

type RouteRow = ApiRoute & { crag_name: string; crag_area: string };

function StarRating({ stars }: { stars: number }) {
  return (
    <span style={{ color: '#f0a93b', fontSize: 12, letterSpacing: 1 }}>
      {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
    </span>
  );
}

function CragsSection() {
  const [crags, setCrags] = useState<ApiCrag[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.crags.list(), api.crags.allRoutes()])
      .then(([c, r]) => { setCrags(c); setAllRoutes(r); })
      .finally(() => setLoading(false));
  }, []);

  const routesFor = (cragId: number) => allRoutes.filter(r => r.crag_id === cragId);

  const filtered = crags.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.area.toLowerCase().includes(search.toLowerCase())
  );

  const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: 0.8, textTransform: 'uppercase', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, verticalAlign: 'middle' };

  function gradeColour(grade: string): string {
    if (grade.startsWith('E4') || grade.startsWith('E5') || grade.startsWith('E6') || grade.startsWith('E7')) return '#c0392b';
    if (grade.startsWith('E')) return '#e67e22';
    if (grade.startsWith('HVS')) return '#f39c12';
    if (grade.startsWith('VS')) return '#27ae60';
    return 'var(--ink-soft)';
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Crags</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: '4px 0 0' }}>
            {loading ? '…' : `${crags.length} crags · ${allRoutes.length} routes`}
          </p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crags…"
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, background: 'var(--card)', color: 'var(--ink)', width: 200, fontFamily: 'inherit' }} />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              {['Crag', 'Area', 'Type', 'Walk-in', 'Aspect', 'Routes', ''].map((h, i) => (
                <th key={i} style={{ ...th, textAlign: h === '' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--ink-faint)', padding: 28 }}>Loading…</td></tr>
            )}
            {!loading && filtered.map((crag, i) => {
              const routes = routesFor(crag.id);
              const isOpen = expanded === crag.id;
              const isLast = i === filtered.length - 1;
              return (
                <>
                  <tr key={crag.id} style={{ borderBottom: isOpen ? 'none' : (isLast ? 'none' : '1px solid var(--line)'), background: isOpen ? 'var(--surface-2)' : 'var(--card)', cursor: 'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : crag.id)}>
                    <td style={{ ...td, fontWeight: 700, color: 'var(--ink)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--ink-faint)', transition: 'transform 0.15s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                        {crag.name}
                      </span>
                    </td>
                    <td style={{ ...td, color: 'var(--ink-soft)' }}>{crag.area || '—'}</td>
                    <td style={td}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'var(--surface-2)', color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>
                        {crag.type}
                      </span>
                    </td>
                    <td style={{ ...td, color: 'var(--ink-faint)' }}>{crag.walkin || '—'}</td>
                    <td style={{ ...td, color: 'var(--ink-faint)' }}>{crag.aspect || '—'}</td>
                    <td style={{ ...td, fontWeight: 700, color: 'var(--rust)' }}>{routes.length}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {crag.photo_url && (
                        <span style={{ fontSize: 11, color: 'var(--ink-faint)', marginRight: 8 }}>📷</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${crag.id}-routes`} style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        {routes.length === 0 ? (
                          <div style={{ padding: '16px 24px', color: 'var(--ink-faint)', fontSize: 13 }}>No routes yet.</div>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                                {['#', 'Route', 'Grade', 'Style', 'Length', 'Stars'].map(h => (
                                  <th key={h} style={{ ...th, fontSize: 10, paddingLeft: h === '#' ? 40 : 14 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {routes.map((r, ri) => (
                                <tr key={r.id} style={{ borderBottom: ri < routes.length - 1 ? '1px solid var(--line)' : 'none', background: 'var(--card)' }}>
                                  <td style={{ ...td, paddingLeft: 40, width: 48 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 11, background: r.color, fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#fff' }}>{r.n}</span>
                                  </td>
                                  <td style={{ ...td, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</td>
                                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: gradeColour(r.grade) }}>{r.grade}</td>
                                  <td style={{ ...td, color: 'var(--ink-soft)' }}>{r.style}</td>
                                  <td style={{ ...td, color: 'var(--ink-faint)' }}>{r.len ? `${r.len}m` : '—'}</td>
                                  <td style={td}><StarRating stars={r.stars} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shell (sidebar + topbar) ─────────────────────────────────────────────────

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'users',     label: 'Users',     icon: '◉' },
  { id: 'crags',     label: 'Crags',     icon: '⛰' },
  { id: 'settings',  label: 'Settings',  icon: '⚙' },
];

function AdminShell({ admin, onLogout }: { admin: ApiUser; onLogout: () => void }) {
  const [section, setSection] = useState<Section>('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-ui)', background: 'var(--surface-2)' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: 'var(--slate)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--rust)', letterSpacing: '-0.03em' }}>atopo</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: 1, marginTop: 3 }}>ADMIN</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setSection(id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left', background: section === id ? 'rgba(255,255,255,0.10)' : 'none', color: section === id ? '#fff' : 'rgba(255,255,255,0.50)', marginBottom: 2, transition: 'background 0.1s' }}>
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</div>
          <button onClick={onLogout} style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 32px 40px' }}>
        {section === 'dashboard' && <Dashboard />}
        {section === 'users'     && <UsersSection currentAdmin={admin} />}
        {section === 'crags'     && <CragsSection />}
        {section === 'settings'  && <Settings />}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminApp() {
  const [adminUser, setAdminUser] = useState<ApiUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    api.auth.me()
      .then(u => { if (u.role === 'admin') setAdminUser(u); else setAdminToken(null); })
      .catch(() => setAdminToken(null))
      .finally(() => setChecking(false));
  }, []);

  function logout() { setAdminToken(null); setAdminUser(null); }

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--ink-faint)', fontSize: 14 }}>Loading…</div>
  );

  if (!adminUser) return <LoginPanel onLogin={setAdminUser} />;
  return <AdminShell admin={adminUser} onLogout={logout} />;
}
