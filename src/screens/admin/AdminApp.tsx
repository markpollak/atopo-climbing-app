import { useState, useEffect } from 'react';
import { api, setAdminToken, getToken, type ApiUser } from '../../api/client';

type AdminView = 'login' | 'users';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      background: isAdmin ? 'var(--rust)' : 'var(--surface-2)',
      color: isAdmin ? '#fff' : 'var(--ink-soft)',
      border: `1px solid ${isAdmin ? 'var(--rust)' : 'var(--line)'}`,
    }}>
      {role.toUpperCase()}
    </span>
  );
}

function LoginPanel({ onLogin }: { onLogin: (u: ApiUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.user.role !== 'admin') {
        setError('Admin access required.');
        return;
      }
      setAdminToken(res.token);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
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
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>
          {error && <div style={{ fontSize: 13, color: 'var(--route-red)', background: '#fff0ef', border: '1px solid #f5ccc9', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
          <button
            type="submit" disabled={loading}
            style={{ marginTop: 4, padding: '12px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
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
      setTimeout(() => setOpen(false), 1500);
    } catch (err: any) {
      setError(err.message ?? 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid var(--line)',
    borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5,
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginTop: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Change password</span>
        <span style={{ fontSize: 12, color: 'var(--ink-faint)', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s' }}>▼</span>
      </button>
      {open && (
        <form onSubmit={submit} style={{ borderTop: '1px solid var(--line)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
          <div><label style={labelStyle}>Current password</label><input type="password" value={current} onChange={e => setCurrent(e.target.value)} required style={inputStyle} /></div>
          <div><label style={labelStyle}>New password</label><input type="password" value={next} onChange={e => setNext(e.target.value)} required style={inputStyle} /></div>
          <div><label style={labelStyle}>Confirm new password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} /></div>
          {error && <div style={{ fontSize: 13, color: 'var(--route-red)', background: '#fff0ef', border: '1px solid #f5ccc9', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}
          {success && <div style={{ fontSize: 13, color: '#2a7a4b', background: '#edfaf3', border: '1px solid #b6e8cc', borderRadius: 8, padding: '8px 12px' }}>Password updated successfully.</div>}
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: 'var(--rust)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, alignSelf: 'flex-start' }}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}

function UsersPanel({ admin, onLogout }: { admin: ApiUser; onLogout: () => void }) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.auth.adminUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)', fontFamily: 'var(--font-ui)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--rust)', letterSpacing: '-0.03em' }}>atopo</span>
          <span style={{ color: 'var(--line)' }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{admin.email}</span>
          <button onClick={onLogout} style={{ fontSize: 13, color: 'var(--rust)', fontWeight: 700, background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Users</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: '4px 0 0' }}>{users.length} registered</p>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, background: 'var(--card)', color: 'var(--ink)', width: 220 }}
          />
        </div>

        {error && <div style={{ color: 'var(--route-red)', marginBottom: 16 }}>{error}</div>}

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                {['Name', 'Email', 'Role', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14 }}>Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14 }}>No users found.</td></tr>
              )}
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{u.name || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>{u.email}</td>
                  <td style={{ padding: '13px 16px' }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--ink-faint)' }}>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ChangePasswordSection />
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [adminUser, setAdminUser] = useState<ApiUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    api.auth.me()
      .then(u => { if (u.role === 'admin') setAdminUser(u); })
      .catch(() => { setAdminToken(null); })
      .finally(() => setChecking(false));
  }, []);

  function logout() {
    setAdminToken(null);
    setAdminUser(null);
  }

  if (checking) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--ink-faint)', fontSize: 14 }}>Loading…</div>;
  }

  if (!adminUser) return <LoginPanel onLogin={setAdminUser} />;
  return <UsersPanel admin={adminUser} onLogout={logout} />;
}
