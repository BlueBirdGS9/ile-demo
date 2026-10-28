/* Ilé Landlord — Applications, Messages, Documents, Settings */

function Applications({ ctx }) {
  const [items, setItems] = useState(window.LD.applications);
  function act(id, status, msg) { setItems(items.map(a => a.id === id ? { ...a, status } : a)); ctx.toast(msg); }
  const statusChip = s => s === 'New' ? <Chip kind="due">New</Chip> : s === 'Reviewing' ? <Chip kind="progress">Reviewing</Chip> : s === 'Approved' ? <Chip kind="paid">Approved</Chip> : <Chip kind="overdue">Declined</Chip>;
  return (
    <div className="page">
      <PageHeader title="Applications" sub="Review rental applications for your vacant units." />
      {items.length ? (
        <div className="grid" style={{ gap: 12 }}>
          {items.map(a => (
            <div key={a.id} className="card card-pad" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <Avatar name={a.applicant} size="lg" />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{a.applicant}</span>{a.verified ? <Vbadge state="verified" sm /> : <Vbadge state="unverified" sm />}</div>
                <div className="msg-snip" style={{ marginTop: 2 }}>Applying for {a.unit} · {a.when}</div>
                <div className="kpi-inline" style={{ marginTop: 8, gap: 20 }}>
                  <div><div className="k">Monthly income</div><div className="v money" style={{ fontSize: '1rem' }}>{money(a.income)}</div></div>
                  <div><div className="k">Trust score</div><div className="v" style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: a.trust >= 85 ? 'var(--success-text)' : a.trust >= 65 ? 'var(--gold-600)' : 'var(--error-text)' }}>{a.trust}</div></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {statusChip(a.status)}
                {a.status !== 'Approved' && a.status !== 'Declined' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => act(a.id, 'Declined', 'Application declined')}>Decline</button>
                    <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => act(a.id, 'Approved', 'Application approved · escrow invite sent'))}>Approve</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="card"><EmptyState icon="file" title="No applications yet" desc="Applications for your vacant units will appear here." /></div>}
    </div>
  );
}

/* ---------------- Messages ---------------- */
function Messages({ ctx }) {
  const [sel, setSel] = useState(window.LD.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.LD.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.LD.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() { const txt = (drafts[sel] || '').trim(); if (!txt) return; setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] })); setDrafts(d => ({ ...d, [sel]: '' })); }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Talk to tenants, vendors and support." />
      <div className="chat">
        <div className="thread-list">
          {window.LD.threads.map(th => (
            <div key={th.id} className={"thread" + (sel === th.id ? " sel" : "")} onClick={() => setSel(th.id)}>
              <Avatar name={th.name} color={th.role === 'Support' ? 'info' : null} />
              <div className="msg-meta"><div className="msg-name">{th.name}{th.unread ? <span className="badge" style={{ background: 'var(--error)', color: '#fff', fontSize: '.6rem', padding: '0 5px', borderRadius: 99 }}>{th.unread}</span> : null}</div><div className="msg-snip">{th.last}</div></div>
              <span className="msg-time">{th.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={t.name} color={t.role === 'Support' ? 'info' : null} />
            <div style={{ flex: 1 }}><div className="msg-name">{t.name}</div><div className="msg-snip">{t.role} · <Icon name="shieldCheck" style={{ width: 12, height: 12, color: 'var(--success)', verticalAlign: '-2px' }} /> Trust {t.trust}</div></div>
            <button className="icon-btn"><Icon name="phone" /></button>
          </div>
          <div className="chat-body" ref={bodyRef}>{msgs[sel].map((m, i) => <div key={i} className={"bubble " + (m.me ? 'me' : 'them')}>{m.text}<span className="bt">{m.t}</span></div>)}</div>
          <div className="chat-input">
            <button className="icon-btn" style={{ border: 'none' }}><Icon name="paperclip" /></button>
            <input placeholder="Write a message…" value={drafts[sel] || ''} onChange={e => setDrafts(d => ({ ...d, [sel]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn btn-primary" onClick={send}><Icon name="send" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Documents ---------------- */
function Documents({ ctx }) {
  const [verifying, setVerifying] = useState(null);
  return (
    <div className="page">
      <PageHeader title="Documents" sub="Titles, leases and financial records — all secured and verifiable." actions={<button className="btn btn-primary"><Icon name="plus" />Upload</button>} />
      <div className="grid cols-2">
        {window.LD.documents.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-thumb"><Icon name="doc" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div>
              <div className="msg-snip">{d.type} · {d.date} · {d.size}</div>
              <div style={{ marginTop: 6 }}>{verifying === d.id ? <span className="tag"><span className="skeleton sk-circle" style={{ width: 12, height: 12 }}></span>Verifying…</span> : <Vbadge state="verified" sm />}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="icon-btn" title="Download"><Icon name="download" /></button>
              <button className="icon-btn" title="Verify authenticity" onClick={() => { setVerifying(d.id); setTimeout(() => { setVerifying(null); ctx.toast('Document authentic ✓'); }, 1400); }}><Icon name="shieldCheck" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings({ ctx }) {
  const [notif, setNotif] = useState({ rent: true, applications: true, maintenance: true, payout: true });
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your profile, payout account and notifications." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Chidi Nwosu" size="lg" color="gold" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Chidi Nwosu</span><span className="avatar-role">Landlord</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={92} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Chidi Nwosu" /></Field>
          <Field label="Email"><input className="input" defaultValue="chidi.nwosu@example.com" /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0023" /></div></Field>
          <Field label="Business name (optional)"><input className="input" defaultValue="Nwosu Properties Ltd" /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Security &amp; verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 10 May 2026' : 'Not verified — required to list, approve tenants or collect rent'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Payout account</h3>
        <div className="settings-row"><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="feed-ic" style={{ background: 'var(--green-50)', color: 'var(--primary)' }}><Icon name="bank" /></div><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>GTBank · ••••4821</div><div className="msg-snip">Chidi Nwosu · Verified account</div></div></div><Vbadge state="verified" /></div>
        <button className="btn btn-secondary" style={{ marginTop: 14 }}><Icon name="plus" />Add payout account</button>
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['rent', 'Rent payments', 'When a tenant pays or misses rent'], ['applications', 'New applications', 'When someone applies for a unit'], ['maintenance', 'Maintenance requests', 'New issues and SLA alerts'], ['payout', 'Payout updates', 'When escrow releases reach your account']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Applications, Messages, Documents, Settings });
