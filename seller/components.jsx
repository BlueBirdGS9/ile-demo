/* Ilé Seller — shared components & primitives */
const { useState, useEffect, useRef } = React;

Object.assign(window.ICONS, {
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  paperclip: '<path d="M20 11 11.5 19.5a4 4 0 0 1-6-5.5L14 5a2.7 2.7 0 0 1 4 3.6L9.5 17"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".4"/>',
  bank: '<path d="M4 10 12 4l8 6M5 10v8M19 10v8M9 10v8M15 10v8M3 21h18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>',
  arrowLeft: '<path d="M19 12H5M11 18 5 12l6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trend: '<path d="M4 16 10 10l3.5 3.5L20 7M20 7h-4M20 7v4"/>',
  trendDown: '<path d="M4 8 10 14l3.5-3.5L20 17M20 17h-4M20 17v-4"/>',
  handshake: '<path d="M11 8 8 5 3 9v4l3 3 2-2M13 8l3-3 5 4v4l-3 3-2-2M8 14l3 3M11 11l2 2"/>',
  gauge: '<path d="M12 13 16 9M5.5 18a9 9 0 1 1 13 0"/><circle cx="12" cy="13" r="1.3"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  phone: '<path d="M5 4h4l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'
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
const statusChip = s => ({ Active: <Chip kind="paid">Active</Chip>, 'Under Offer': <Chip kind="due">Under offer</Chip>, 'In Escrow': <Chip kind="escrow">In escrow</Chip>, Sold: <Chip kind="escrow">Sold</Chip>, Draft: <Chip kind="draft">Draft</Chip> }[s] || <Chip kind="resolved">{s}</Chip>);
const offerChip = s => ({ New: <Chip kind="progress">New</Chip>, Submitted: <Chip kind="progress">Submitted</Chip>, Countered: <Chip kind="due">Countered</Chip>, Accepted: <Chip kind="paid">Accepted</Chip>, Rejected: <Chip kind="overdue">Declined</Chip> }[s] || <Chip kind="resolved">{s}</Chip>);

function TrustRing({ val, size = 56, label, tier }) {
  const color = val >= 85 ? 'var(--success)' : val >= 65 ? 'var(--gold-500)' : 'var(--error)';
  return <div className="trust"><div className="trust-ring" style={{ '--val': val, '--score-color': color, '--sz': size + 'px', position: 'relative' }}><div className="inner">{val}</div></div>{(label || tier) && <div className="trust-meta">{label && <span className="trust-label">{label}</span>}{tier && <span className="trust-tier">{tier}</span>}</div>}</div>;
}

function Avatar({ name, role, size, color }) {
  const initials = (name || 'GR').split(' ').map(s => s[0]).slice(0, 2).join('');
  const cls = 'avatar' + (size === 'sm' ? ' avatar--sm' : size === 'lg' ? ' avatar--lg' : '');
  const palette = color === 'gold' ? { background: 'var(--gold-100)', color: 'var(--gold-600)' } : color === 'info' ? { background: 'var(--info-bg)', color: 'var(--info-text)' } : color === 'escrow' ? { background: 'var(--escrow-bg)', color: 'var(--escrow-text)' } : null;
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
        <div className="nav-section">Seller</div>
        {window.SD.nav.map(([ic, label, key]) => (
          <a key={key} className={"nav-item" + (route === key ? " active" : "")} onClick={() => onNav(key)}>
            <Icon name={ic} />{label}{badges && badges[key] ? <span className="badge">{badges[key]}</span> : null}
          </a>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--ink-100)' }}>
        {verified ? (
          <div className="avatar-block" style={{ padding: '6px 10px' }}>
            <div className="avatar avatar--sm" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>YC</div>
            <div className="avatar-meta"><span className="avatar-name">Yewande Coker</span><span className="avatar-role">Seller · Trust 93</span></div>
          </div>
        ) : (
          <button className="verify-pill" onClick={onVerify} title="Verify your identity">
            <div className="avatar avatar--sm" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>YC</div>
            <div className="avatar-meta"><span className="avatar-name">Yewande Coker</span><span className="verify-pill-state"><Icon name="shield" />Unverified</span></div>
            <span className="verify-pill-cta">Verify</span>
          </button>
        )}
      </div>
    </aside>
  );
}

const SELLER_NOTIFS = [
  ['handshake', 'gold', 'New offer', 'Adaeze Okonkwo offered ₦176M on your Lekki duplex', '1h', true],
  ['lock', 'escrow', 'Escrow funded', 'Buyer deposit secured for the Ikoyi villa sale', '6h', true],
  ['eye', 'info', 'Listing milestone', 'Your Lekki duplex passed 4,000 views', '1d', false],
  ['shieldCheck', 'green', 'Verify to unlock', 'Finish verification to list & accept offers', '2d', false]
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
      <div className="topbar-search"><Icon name="search" /><input placeholder="Search properties, offers, buyers…" /></div>
      <div className="topbar-spacer"></div>
      <button className="icon-btn" onClick={() => onNav('messages')}><Icon name="message" /><span className="ping"></span></button>
      <NotificationsMenu items={SELLER_NOTIFS} />
      <AccountMenu name="Yewande Coker" email="yewande.coker@example.com" color="gold" onNav={onNav} onSignOut={onSignOut} />
    </header>
  );
}

function PageHeader({ title, sub, actions }) {
  return <div className="page-head"><div><h1 className="page-title">{title}</h1>{sub && <p className="page-sub">{sub}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
function Stat({ icon, tone, label, value, money: isMoney, foot }) {
  return <div className="stat"><div className="stat-top"><div><div className="stat-label">{label}</div><div className={"stat-value" + (isMoney ? " money" : "")}>{value}</div></div><div className={"stat-ic " + tone}><Icon name={icon} /></div></div>{foot}</div>;
}
function Milestones({ steps }) {
  return (
    <div className="milestones">
      {steps.map(s => (
        <div key={s.key} className={"ms " + s.state}>
          <div className="ms-line"></div>
          <div className="ms-node">{s.state === 'done' ? <Icon name="check" /> : s.state === 'active' ? <Icon name="lock" /> : <Icon name={s.key === 'completion' ? 'key' : s.key === 'verification' ? 'shieldCheck' : s.key === 'offer' ? 'handshake' : 'wallet'} />}</div>
          <div className="ms-title">{s.title}</div>
          <div className="ms-desc">{s.desc}</div>
          {s.amount ? <div className="ms-amount">{money(s.amount)}</div> : null}
          {s.date ? <div className="ms-date">{s.date}</div> : null}
        </div>
      ))}
    </div>
  );
}
function EmptyState({ icon, title, desc, actions }) {
  return <div className="state state--empty"><div className="state-icon"><Icon name={icon || 'inbox'} /></div><div className="state-title">{title}</div><div className="state-desc">{desc}</div>{actions && <div className="state-actions">{actions}</div>}</div>;
}
function Skeleton({ h, w, r }) { return <div className="skeleton" style={{ height: h || 12, width: w || '100%', borderRadius: r || 6 }}></div>; }

/* Trust banner shown to unverified sellers */
function VerifyBanner({ onVerify }) {
  return (
    <div className="verify-banner">
      <div className="vb-ic"><Icon name="shield" /></div>
      <div className="vb-txt">
        <strong>You’re exploring as an unverified member.</strong>
        <span>Verify your identity to list properties, accept offers and get paid through escrow.</span>
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
        <p className="vm-sub">A one-time check unlocks listing, accepting offers and escrow payouts — about 2 minutes. Browsing stays open either way.</p>
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

/* Seller property card */
function SellCard({ p, onOpen }) {
  return (
    <div className="pcard" onClick={() => onOpen && onOpen(p.id)}>
      <div className="pcard-media">
        <div className="pcard-img" style={p.photos && p.photos.length ? { backgroundImage: 'url(' + p.photos[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 12px,var(--ink-50) 12px,var(--ink-50) 24px)', display: 'grid', placeItems: 'center' }}>{!(p.photos && p.photos.length) && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--ink-400)' }}>{p.image}</span>}</div>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>{statusChip(p.status)}</div>
      </div>
      <div className="pcard-body">
        <div className="pcard-price">{moneyShort(p.price)}<span className="per"> · for sale</span></div>
        <div className="pcard-title">{p.title}</div>
        <div className="pcard-loc"><Icon name="mapPin" />{p.area}, {p.city}</div>
        <div className="listing-metrics">
          <span><Icon name="eye" />{p.views.toLocaleString()}</span>
          <span><Icon name="heart" />{p.saves}</span>
          <span><Icon name="message" />{p.enquiries}</span>
          {p.verified ? <span className="vbadge vbadge--verified" style={{ marginLeft: 'auto' }}><Icon name="shieldCheck" />{p.title_doc}</span> : <span className="vbadge vbadge--pending" style={{ marginLeft: 'auto' }}><Icon name="clock" />Pending</span>}
        </div>
      </div>
    </div>
  );
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

Object.assign(window, { BottomNav, Icon, money, moneyShort, Vbadge, Chip, statusChip, offerChip, TrustRing, Avatar, Field, Sidebar, TopBar, AccountMenu, NotificationsMenu, PageHeader, Stat, Milestones, EmptyState, Skeleton, SellCard, VerifyBanner, VerifyModal });
