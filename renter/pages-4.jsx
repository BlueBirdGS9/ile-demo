/* Ilé Renter — Messages, Documents, Reviews, Settings, Applications */

function Applications({ ctx }) {
  const apps = [
    { id: 'a1', p: window.RD.find('p2'), status: 'Under Review', when: 'Submitted 26 May 2026', chip: 'progress' },
    { id: 'a2', p: window.RD.find('p5'), status: 'Approved', when: 'Approved 18 May 2026', chip: 'paid' },
    { id: 'a3', p: window.RD.find('p4'), status: 'Declined', when: 'Closed 02 May 2026', chip: 'overdue' }
  ];
  return (
    <div className="page">
      <PageHeader title="Applications" sub="Track every rental application you’ve submitted." actions={<button className="btn btn-primary" onClick={() => ctx.go('discover')}><Icon name="plus" />New application</button>} />
      <div className="grid" style={{ gap: 12 }}>
        {apps.map(a => (
          <div key={a.id} className="issue-card" onClick={() => ctx.go('details', a.p.id)}>
            <div style={{ width: 92, height: 68, borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 10px,var(--ink-50) 10px,var(--ink-50) 20px)', flex: 'none', display: 'grid', placeItems: 'center' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--ink-400)' }}>{a.p.type}</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{a.p.title}</div><Chip kind={a.chip}>{a.status}</Chip></div>
              <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{a.p.area}, {a.p.city}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}><span className="money" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{money(a.p.price)}<span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', fontFamily: 'var(--font-sans)' }}> /year</span></span><span className="msg-time">{a.when}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */
function Messages({ ctx }) {
  const [sel, setSel] = useState(window.RD.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.RD.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.RD.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() {
    const txt = (drafts[sel] || '').trim(); if (!txt) return;
    setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] }));
    setDrafts(d => ({ ...d, [sel]: '' }));
  }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Chat with landlords, agents and support — all verified." />
      <div className="chat">
        <div className="thread-list">
          {window.RD.threads.map(th => (
            <div key={th.id} className={"thread" + (sel === th.id ? " sel" : "")} onClick={() => setSel(th.id)}>
              <Avatar name={th.name} color={th.role === 'Support' ? 'info' : th.role === 'Agent' ? 'gold' : null} />
              <div className="msg-meta"><div className="msg-name">{th.name}{th.unread ? <span className="badge" style={{ background: 'var(--error)', color: '#fff', fontSize: '.6rem', padding: '0 5px', borderRadius: 99 }}>{th.unread}</span> : null}</div><div className="msg-snip">{th.last}</div></div>
              <span className="msg-time">{th.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={t.name} color={t.role === 'Support' ? 'info' : t.role === 'Agent' ? 'gold' : null} />
            <div style={{ flex: 1 }}><div className="msg-name">{t.name}</div><div className="msg-snip">{t.role} · <Icon name="shieldCheck" style={{ width: 12, height: 12, color: 'var(--success)', verticalAlign: '-2px' }} /> Trust {t.trust}</div></div>
            <button className="icon-btn"><Icon name="phone" /></button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {msgs[sel].map((m, i) => <div key={i} className={"bubble " + (m.me ? 'me' : 'them')}>{m.text}<span className="bt">{m.t}</span></div>)}
          </div>
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
      <PageHeader title="Documents" sub="Your secure vault — leases, receipts and certificates, all verifiable." actions={<button className="btn btn-secondary"><Icon name="download" />Download all</button>} />
      <div className="grid cols-2">
        {window.RD.documents.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-thumb"><Icon name="doc" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div>
              <div className="msg-snip">{d.type} · {d.date} · {d.size}</div>
              <div style={{ marginTop: 6 }}>{verifying === d.id ? <span className="tag"><span className="skeleton sk-circle" style={{ width: 12, height: 12 }}></span>Verifying…</span> : d.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}</div>
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

/* ---------------- Reviews ---------------- */
function Reviews({ ctx }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const past = [
    { who: 'You → Chidi Nwosu (Landlord)', stars: 5, when: 'Aug 2025', text: 'Responsive landlord, repairs handled quickly. The escrow process gave me real peace of mind.' },
    { who: 'You → Estate Facility', stars: 4, when: 'May 2026', text: 'Gate intercom fixed within two days. Friendly team.' }
  ];
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <PageHeader title="Reviews" sub="Honest reviews build trust for the whole community." />
      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Rate your landlord</h3>
        {submitted ? (
          <div className="trust-callout"><Icon name="check" style={{ color: 'var(--success)' }} /><p><b>Thanks for your review!</b> It’s now part of {window.RD.lease.landlord}’s trust profile.</p></div>
        ) : <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <Avatar name={window.RD.lease.landlord} role="Your landlord" />
            <div className="stars" style={{ marginLeft: 'auto' }} onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map(n => <svg key={n} className={(hover || rating) >= n ? 'on' : ''} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16l-4.8 2.8 1-5.4-4-3.7 5.4-.7L12 4Z" /></svg>)}
            </div>
          </div>
          <Field label="Your review"><textarea className="textarea" rows="3" placeholder="Share your honest experience…" value={text} onChange={e => setText(e.target.value)}></textarea></Field>
          <Field label="Add a photo (optional)">{photo ? <div className="file-row"><div className="file-ic"><Icon name="camera" /></div><div className="file-meta"><div className="file-name">review-photo.jpg</div><div className="file-sub"><Icon name="check" style={{ width: 14, height: 14, color: 'var(--success)' }} />Attached</div></div></div> : <div className="upload" style={{ padding: 16 }} onClick={() => setPhoto(true)}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)' }}><Icon name="camera" style={{ width: 16, height: 16, verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} />Add photo</div></div>}</Field>
          <button className="btn btn-primary" disabled={!rating || !text} onClick={() => setSubmitted(true)}>Submit review</button>
        </>}
      </div>
      <div className="section-head"><h3>Your past reviews</h3></div>
      <div className="card card-pad">
        {past.map((r, i) => (
          <div key={i} className="review-row" style={{ borderBottom: i < past.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
            <Avatar name="Adaeze Okonkwo" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r.who}</div><span className="msg-time">{r.when}</span></div>
              <div className="stars" style={{ margin: '4px 0' }}>{[1, 2, 3, 4, 5].map(n => <svg key={n} className={r.stars >= n ? 'on' : ''} style={{ width: 15, height: 15 }} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"><path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16l-4.8 2.8 1-5.4-4-3.7 5.4-.7L12 4Z" /></svg>)}</div>
              <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0 }}>{r.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings({ ctx }) {
  const [notif, setNotif] = useState({ rent: true, maintenance: true, messages: true, marketing: false });
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your profile, security and notifications." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Adaeze Okonkwo" size="lg" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Adaeze Okonkwo</span><span className="avatar-role">Renter</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={92} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Adaeze Okonkwo" /></Field>
          <Field label="Email"><input className="input" defaultValue="adaeze.o@example.com" /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0025" /></div></Field>
          <Field label="City"><select className="select"><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Security & verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 12 May 2026' : 'Not verified — required to apply, pay or message owners'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
        {[['Two-factor authentication', 'SMS to +234 800 ••• 0000', 'on'], ['Password', 'Last changed 3 months ago', 'change']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div>{r[2] === 'on' ? <Chip kind="paid">Enabled</Chip> : <button className="btn btn-secondary btn-sm">Change</button>}</div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['rent', 'Rent reminders', 'Get notified before rent is due'], ['maintenance', 'Maintenance updates', 'Status changes on your issues'], ['messages', 'New messages', 'Landlord, agent & support replies'], ['marketing', 'New listings & offers', 'Homes matching your saved searches']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Applications, Messages, Documents, Reviews, Settings });
