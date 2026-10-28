/* Ilé Agent — shared components & primitives */
const { useState, useEffect, useRef } = React;

Object.assign(window.ICONS, {
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  paperclip: '<path d="M20 11 11.5 19.5a4 4 0 0 1-6-5.5L14 5a2.7 2.7 0 0 1 4 3.6L9.5 17"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".4"/>',
  phone: '<path d="M5 4h4l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  arrowLeft: '<path d="M19 12H5M11 18 5 12l6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trend: '<path d="M4 16 10 10l3.5 3.5L20 7M20 7h-4M20 7v4"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4ZM9 11l1.5 1.5L14 9"/>',
  navigation: '<path d="M3 11 21 4l-7 17-2-7-7-3Z"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.2"/>',
  signpost: '<path d="M12 3v18M12 6h7l2 2-2 2h-7M12 11H5l-2 2 2 2h7"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  userPlus: '<circle cx="9" cy="8" r="3.5"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M18 8v6M21 11h-6"/>'
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
const taskChip = s => ({ 'To Do': <Chip kind="draft">To do</Chip>, 'In Progress': <Chip kind="progress">In progress</Chip>, Done: <Chip kind="paid">Done</Chip> }[s] || <Chip kind="resolved">{s}</Chip>);
const viewChip = s => ({ Upcoming: <Chip kind="due">Upcoming</Chip>, 'Checked-in': <Chip kind="progress">Checked in</Chip>, Completed: <Chip kind="paid">Completed</Chip> }[s] || <Chip kind="resolved">{s}</Chip>);
const TASK_ICON = { Photos: 'camera', Documents: 'doc', Signage: 'signpost', Handover: 'key', Inspection: 'shieldCheck' };

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
        <div className="nav-section">Field Agent</div>
        {window.AD.nav.map(([ic, label, key]) => (
          <a key={key} className={"nav-item" + (route === key ? " active" : "")} onClick={() => onNav(key)}>
            <Icon name={ic} />{label}{badges && badges[key] ? <span className="badge">{badges[key]}</span> : null}
          </a>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--ink-100)' }}>
        {verified ? (
          <div className="avatar-block" style={{ padding: '6px 10px' }}>
            <div className="avatar avatar--sm" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>TA</div>
            <div className="avatar-meta"><span className="avatar-name">Tobi Adeniyi</span><span className="avatar-role">Prime Realty · Agent</span></div>
          </div>
        ) : (
          <button className="verify-pill" onClick={onVerify} title="Verify your identity">
            <div className="avatar avatar--sm" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>TA</div>
            <div className="avatar-meta"><span className="avatar-name">Tobi Adeniyi</span><span className="verify-pill-state"><Icon name="shield" />Unverified</span></div>
            <span className="verify-pill-cta">Verify</span>
          </button>
        )}
      </div>
    </aside>
  );
}

const AGENT_NOTIFS = [
  ['clipboard', 'gold', 'New task assigned', 'Photograph living areas · Banana Island Villa', '3h', true],
  ['wallet', 'green', 'Payout received', '₦10,000 released for the Ikoyi viewing', '1d', true],
  ['calendar', 'info', 'Viewing confirmed', 'Adaeze Okonkwo · Ikoyi · Sat 10am', '5h', false],
  ['shieldCheck', 'green', 'Verify to unlock', 'Finish verification to claim work & get paid', '2d', false]
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
      <div className="topbar-search"><Icon name="search" /><input placeholder="Search viewings, tasks, leads…" /></div>
      <div className="topbar-spacer"></div>
      <button className="icon-btn" onClick={() => onNav('messages')}><Icon name="message" /><span className="ping"></span></button>
      <NotificationsMenu items={AGENT_NOTIFS} />
      <AccountMenu name="Tobi Adeniyi" email="tobi.adeniyi@primerealty.ng" color="info" onNav={onNav} onSignOut={onSignOut} />
    </header>
  );
}

function PageHeader({ title, sub, actions }) {
  return <div className="page-head"><div><h1 className="page-title">{title}</h1>{sub && <p className="page-sub">{sub}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
function Stat({ icon, tone, label, value, money: isMoney, foot }) {
  return <div className="stat"><div className="stat-top"><div><div className="stat-label">{label}</div><div className={"stat-value" + (isMoney ? " money" : "")}>{value}</div></div><div className={"stat-ic " + tone}><Icon name={icon} /></div></div>{foot}</div>;
}
function EmptyState({ icon, title, desc, actions }) {
  return <div className="state state--empty"><div className="state-icon"><Icon name={icon || 'inbox'} /></div><div className="state-title">{title}</div><div className="state-desc">{desc}</div>{actions && <div className="state-actions">{actions}</div>}</div>;
}

/* Trust banner shown to unverified agents */
function VerifyBanner({ onVerify }) {
  return (
    <div className="verify-banner">
      <div className="vb-ic"><Icon name="shield" /></div>
      <div className="vb-txt">
        <strong>You’re exploring as an unverified member.</strong>
        <span>Verify your identity to claim field work, log completed jobs and get paid.</span>
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
        <p className="vm-sub">A one-time check unlocks claiming work, logging jobs and getting paid — about 2 minutes. Browsing stays open either way.</p>
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

/* Secure property-access panel: the brokerage sets it; the agent reveals the
   code only on arrival (logged), then confirms the key is returned/secured. */
function AccessPanel({ access, id, title }) {
  if (!access) return null;
  const CHK = 'grt_checkins';
  const read = () => { try { return JSON.parse(localStorage.getItem(CHK)) || {}; } catch (e) { return {}; } };
  const [state, setState] = useState(() => read()[id] || 'before');
  const [copied, setCopied] = useState(false);
  const meta = window.AD.accessMeta(access.method);
  const hasCode = access.method === 'lockbox' && access.code;
  const revealed = state === 'in' || state === 'done';

  function persist(s) { const all = read(); all[id] = s; try { localStorage.setItem(CHK, JSON.stringify(all)); } catch (e) {} setState(s); }
  function arrive() { persist('in'); window.AD.logAccess({ event: 'checkin', propTitle: title || '', method: access.method, label: meta.label }); }
  function secure() { persist('done'); window.AD.logAccess({ event: 'checkout', propTitle: title || '', method: access.method, label: meta.label }); }
  function copyCode() { try { navigator.clipboard.writeText(access.code); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1500); }

  return (
    <div className="access-panel">
      <div className="ap-head">
        <span className="ap-method"><Icon name={meta.icon} />{meta.label}</span>
        <span className="ap-src"><Icon name="shieldCheck" />Set by Prime Realty</span>
      </div>
      {access.where && <div className="ap-row"><Icon name="mapPin" /><span>{access.where}</span></div>}
      {access.contact && access.contact.name && (
        <div className="ap-row ap-contact">
          <Icon name="user" /><span>{access.contact.name}</span>
          {access.contact.phone && <a className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', border: '1px solid var(--ink-200)' }} href={"tel:" + access.contact.phone}><Icon name="phone" />Call</a>}
        </div>
      )}
      {access.notes && <div className="ap-note"><Icon name="info" /><span>{access.notes}</span></div>}
      {hasCode && (
        <div className="ap-code-box">
          <div className="ap-code-lbl">Lockbox code</div>
          {revealed
            ? <div className="ap-code"><span className="ap-code-val">{access.code}</span><button className="ap-copy" onClick={copyCode}><Icon name={copied ? 'check' : 'copy'} />{copied ? 'Copied' : 'Copy'}</button></div>
            : <div className="ap-code masked"><span className="ap-code-val">• • • •</span><span className="ap-locked"><Icon name="lock" />Hidden until you arrive</span></div>}
        </div>
      )}
      <div className="ap-foot">
        <span className="ap-logged"><Icon name="eye" />Access is logged</span>
        {state === 'before' && <button className="btn btn-primary btn-sm" onClick={arrive}><Icon name={hasCode ? 'lock' : 'navigation'} />{hasCode ? 'I’ve arrived — reveal code' : 'I’ve arrived'}</button>}
        {state === 'in' && <button className="btn btn-secondary btn-sm" onClick={secure}><Icon name="check" />Key returned / secured</button>}
        {state === 'done' && <span className="ap-done"><Icon name="check" />Checked out · secured</span>}
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

Object.assign(window, { BottomNav, Icon, money, moneyShort, Vbadge, Chip, taskChip, viewChip, TASK_ICON, TrustRing, Avatar, Field, Sidebar, TopBar, AccountMenu, NotificationsMenu, PageHeader, Stat, EmptyState, AccessPanel, VerifyBanner, VerifyModal });
