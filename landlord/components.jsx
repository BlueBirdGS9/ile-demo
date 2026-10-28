/* Ilé Landlord — shared components & primitives */
const { useState, useEffect, useRef } = React;

Object.assign(window.ICONS, {
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  paperclip: '<path d="M20 11 11.5 19.5a4 4 0 0 1-6-5.5L14 5a2.7 2.7 0 0 1 4 3.6L9.5 17"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".4"/>',
  bank: '<path d="M4 10 12 4l8 6M5 10v8M19 10v8M9 10v8M15 10v8M3 21h18"/>',
  mobile: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  refresh: '<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M18 4v4h-4M6 20v-4h4"/>',
  trash: '<path d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>',
  schedule: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4M9 14l2 2 4-4"/>',
  phone: '<path d="M5 4h4l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  arrowLeft: '<path d="M19 12H5M11 18 5 12l6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/>',
  exit: '<path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  sliders: '<path d="M4 8h8M16 8h4M4 16h4M12 16h8"/><circle cx="14" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>'
});

function Icon({ name, className, style }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: window.ICONS[name] || '' }} />;
}
const money = n => '₦' + Number(n).toLocaleString('en-NG');
const moneyShort = n => n >= 1e6 ? '₦' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M' : '₦' + (n / 1e3).toFixed(0) + 'k';

function Vbadge({ state, sm }) {
  const map = { verified: ['verified', 'shieldCheck', 'Verified'], pending: ['pending', 'clock', 'Pending'], unverified: ['unverified', 'shield', 'Unverified'] };
  const [cls, ic, label] = map[state] || map.unverified;
  return <span className={"vbadge vbadge--" + cls} style={sm ? { fontSize: '.72rem', padding: '3px 8px' } : null}><Icon name={ic} />{label}</span>;
}
function Chip({ kind, children }) { return <span className={"chip chip--" + kind}><span className="dot"></span>{children}</span>; }
const rentChip = s => s === 'paid' ? <Chip kind="paid">Paid</Chip> : s === 'due' ? <Chip kind="due">Due</Chip> : s === 'overdue' ? <Chip kind="overdue">Overdue</Chip> : null;

function TrustRing({ val, size = 56, label, tier }) {
  const color = val >= 85 ? 'var(--success)' : val >= 65 ? 'var(--gold-500)' : 'var(--error)';
  return (
    <div className="trust">
      <div className="trust-ring" style={{ '--val': val, '--score-color': color, '--sz': size + 'px', position: 'relative' }}><div className="inner">{val}</div></div>
      {(label || tier) && <div className="trust-meta">{label && <span className="trust-label">{label}</span>}{tier && <span className="trust-tier">{tier}</span>}</div>}
    </div>
  );
}

function Avatar({ name, role, size, color }) {
  const initials = (name || 'GR').split(' ').map(s => s[0]).slice(0, 2).join('');
  const cls = 'avatar' + (size === 'sm' ? ' avatar--sm' : size === 'lg' ? ' avatar--lg' : '');
  const palette = color === 'gold' ? { background: 'var(--gold-100)', color: 'var(--gold-600)' } : color === 'info' ? { background: 'var(--info-bg)', color: 'var(--info-text)' } : null;
  if (!role) return <div className={cls} style={palette}>{initials}</div>;
  return <div className="avatar-block"><div className={cls} style={palette}>{initials}</div><div className="avatar-meta"><span className="avatar-name">{name}</span><span className="avatar-role">{role}</span></div></div>;
}

function Field({ label, req, hint, children }) {
  return <div className="field" style={{ marginBottom: 16 }}>{label && <label className="field-label">{label}{req && <span className="req"> *</span>}</label>}{children}{hint && <span className="field-hint">{hint}</span>}</div>;
}

function Sidebar({ route, onNav, badges, verified, onVerify }) {
  return (
    <aside className="sidebar app-sidebar">
      <a className="sidebar-brand" href="GetRentos Home.html" title="Switch workspace" style={{ textDecoration: 'none' }}><span className="ile-mark"></span><span className="ile-word">Ile</span></a>
      <nav className="nav">
        <div className="nav-section">Landlord</div>
        {window.LD.nav.map(([ic, label, key]) => (
          <a key={key} className={"nav-item" + (route === key ? " active" : "")} onClick={() => onNav(key)}>
            <Icon name={ic} />{label}{badges && badges[key] ? <span className="badge">{badges[key]}</span> : null}
          </a>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--ink-100)' }}>
        {verified ? (
          <div className="avatar-block" style={{ padding: '6px 10px' }}>
            <div className="avatar avatar--sm" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>CN</div>
            <div className="avatar-meta"><span className="avatar-name">Chidi Nwosu</span><span className="avatar-role">Trust 92 · Verified</span></div>
          </div>
        ) : (
          <button className="verify-pill" onClick={onVerify} title="Verify your identity">
            <div className="avatar avatar--sm" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>CN</div>
            <div className="avatar-meta"><span className="avatar-name">Chidi Nwosu</span><span className="verify-pill-state"><Icon name="shield" />Unverified</span></div>
            <span className="verify-pill-cta">Verify</span>
          </button>
        )}
      </div>
    </aside>
  );
}

const LANDLORD_NOTIFS = [
  ['file', 'gold', 'New application', 'A verified applicant applied for Admiralty Court · A1', '2h', true],
  ['wallet', 'green', 'Rent collected', '₦4.8M released from escrow to your account', '5h', true],
  ['wrench', 'warn', 'Maintenance reported', 'Kelechi Obi reported a plumbing issue in B2', '1d', false],
  ['shieldCheck', 'green', 'Verify to unlock', 'Finish verification to list & collect rent', '2d', false]
];

function NotificationsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const unread = !seen && (items || []).some(n => n[5]);
  return (
    <div className="acct">
      <button className="icon-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications"><Icon name="bell" />{unread && <span className="ping"></span>}</button>
      {open && (
        <>
          <div className="acct-scrim" onClick={() => setOpen(false)}></div>
          <div className="notif-menu">
            <div className="notif-head"><span>Notifications</span>{(items || []).some(n => n[5]) && !seen && <button className="notif-mark" onClick={() => setSeen(true)}>Mark all read</button>}</div>
            <div className="notif-list">
              {(items && items.length) ? items.map((n, i) => (
                <div key={i} className={"notif-item" + (!seen && n[5] ? " unread" : "")}>
                  <div className={"notif-ic " + (n[1] || 'info')}><Icon name={n[0]} /></div>
                  <div className="notif-txt"><div className="notif-title">{n[2]}</div><div className="notif-detail">{n[3]}</div><div className="notif-time">{n[4]}</div></div>
                </div>
              )) : <div className="notif-empty">You’re all caught up.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AccountMenu({ name, email, color, onNav, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="acct">
      <button className="acct-trigger" onClick={() => setOpen(o => !o)} aria-label="Account"><Avatar name={name} color={color} /></button>
      {open && (
        <>
          <div className="acct-scrim" onClick={() => setOpen(false)}></div>
          <div className="acct-menu">
            <div className="acct-head"><Avatar name={name} color={color} /><div className="acct-id"><span className="acct-name">{name}</span><span className="acct-email">{email}</span></div></div>
            <button className="acct-item" onClick={() => { setOpen(false); onNav && onNav('settings'); }}><Icon name="settings" />Settings</button>
            <button className="acct-item danger" onClick={() => { setOpen(false); onSignOut && onSignOut(); }}><Icon name="logout" />Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}

function TopBar({ onMenu, onNav, onSignOut }) {
  return (
    <header className="topbar">
      <button className="icon-btn hamburger" onClick={onMenu}><Icon name="list" /></button>
      <a className="topbar-brand" href="GetRentos Home.html" title="Ilé Home"><span className="ile-mark"></span><span className="ile-word">Ile</span></a>
      <div className="topbar-search"><Icon name="search" /><input placeholder="Search tenants, units, payments…" /></div>
      <div className="topbar-spacer"></div>
      <button className="icon-btn" onClick={() => onNav('messages')}><Icon name="message" /><span className="ping"></span></button>
      <NotificationsMenu items={LANDLORD_NOTIFS} />
      <AccountMenu name="Chidi Nwosu" email="chidi.nwosu@example.com" color="gold" onNav={onNav} onSignOut={onSignOut} />
    </header>
  );
}

function PageHeader({ title, sub, actions }) {
  return <div className="page-head"><div><h1 className="page-title">{title}</h1>{sub && <p className="page-sub">{sub}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

function Stat({ icon, tone, label, value, money: isMoney, foot }) {
  return (
    <div className="stat">
      <div className="stat-top"><div><div className="stat-label">{label}</div><div className={"stat-value" + (isMoney ? " money" : "")}>{value}</div></div><div className={"stat-ic " + tone}><Icon name={icon} /></div></div>
      {foot}
    </div>
  );
}

function BarChart({ data, fmt }) {
  const max = Math.max(...data.map(d => d.v));
  const peakIdx = data.indexOf(data.reduce((a, b) => b.v > a.v ? b : a));
  return (
    <div className="barchart">
      {data.map((d, i) => (
        <div key={d.m} className="bar-col">
          <div className={"bar" + (i === peakIdx ? " peak" : "")} style={{ height: (d.v / max * 100) + '%' }} data-v={fmt ? fmt(d.v) : d.v}></div>
          <span className="bar-label">{d.m}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, desc, actions }) {
  return <div className="state state--empty"><div className="state-icon"><Icon name={icon || 'inbox'} /></div><div className="state-title">{title}</div><div className="state-desc">{desc}</div>{actions && <div className="state-actions">{actions}</div>}</div>;
}
function Skeleton({ h, w, r }) { return <div className="skeleton" style={{ height: h || 12, width: w || '100%', borderRadius: r || 6 }}></div>; }

/* Trust banner shown to unverified landlords */
function VerifyBanner({ onVerify }) {
  return (
    <div className="verify-banner">
      <div className="vb-ic"><Icon name="shield" /></div>
      <div className="vb-txt">
        <strong>You’re exploring as an unverified member.</strong>
        <span>Verify your identity to list properties, approve tenants and collect rent through escrow.</span>
      </div>
      <button className="btn btn-primary btn-sm vb-btn" onClick={onVerify}><Icon name="shieldCheck" />Verify now</button>
    </div>
  );
}

/* Just-in-time identity verification sheet (the trust boundary) */
function VerifyModal({ onClose, onComplete }) {
  const [busy, setBusy] = useState(false);
  const steps = [
    ['shieldCheck', 'National Identity Number', 'Checked against NIMC in seconds'],
    ['doc', 'Government ID', 'Driver’s licence, passport or voter’s card'],
    ['camera', 'Liveness selfie', 'Confirms it’s really you']
  ];
  function start() { setBusy(true); setTimeout(() => onComplete(), 1700); }
  return (
    <div className="vm-scrim" onClick={onClose}>
      <div className="vm-card" onClick={e => e.stopPropagation()}>
        <button className="vm-x" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        <div className="vm-badge"><Icon name="shieldCheck" /></div>
        <h2 className="vm-title">Verify your identity</h2>
        <p className="vm-sub">A one-time check unlocks listing, approving tenants and rent collection — about 2 minutes. Browsing stays open either way.</p>
        <div className="vm-list">
          {steps.map(s => (
            <div className="vm-step" key={s[1]}>
              <div className="vm-step-ic"><Icon name={s[0]} /></div>
              <div><div className="vm-step-t">{s[1]}</div><div className="vm-step-d">{s[2]}</div></div>
            </div>
          ))}
        </div>
        <div className="trust-callout vm-callout"><Icon name="lock" /><p>Your NIN is encrypted and verified against NIMC — never shown publicly.</p></div>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy} onClick={start}>
          {busy ? <><span className="vm-spin"></span>Verifying…</> : <><Icon name="shieldCheck" />Verify now</>}
        </button>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={onClose} disabled={busy}>Maybe later</button>
      </div>
    </div>
  );
}

function SLA({ hours }) {
  if (hours === 0) return <span className="sla ok"><Icon name="check" />Met</span>;
  const cls = hours <= 12 ? 'breach' : hours <= 24 ? 'warn' : 'ok';
  return <span className={"sla " + cls}><Icon name="clock" />{hours}h left</span>;
}

function BottomNav({ nav, route, onNav, badges, onMore }) {
  const primary = nav.slice(0, 4);
  return (
    <nav className="bottom-nav">
      {primary.map(([ic, label, key]) => (
        <button key={key} className={"bn-item" + (route === key ? " active" : "")} onClick={() => onNav(key)}>
          <span className="bn-ic"><Icon name={ic} />{badges && badges[key] ? <span className="bn-dot"></span> : null}</span>
          <span className="bn-label">{label}</span>
        </button>
      ))}
      <button className="bn-item" onClick={onMore}>
        <span className="bn-ic"><Icon name="list" /></span>
        <span className="bn-label">More</span>
      </button>
    </nav>
  );
}

Object.assign(window, { BottomNav, Icon, money, moneyShort, Vbadge, Chip, rentChip, TrustRing, Avatar, Field, Sidebar, TopBar, AccountMenu, NotificationsMenu, PageHeader, Stat, BarChart, EmptyState, Skeleton, SLA, VerifyBanner, VerifyModal });
