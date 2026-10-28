/* Ilé Agent — Earnings, Messages, Settings */

function Earnings({ ctx }) {
  const paid = window.AD.payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = window.AD.viewings.filter(v => v.date === 'Today').reduce((s, v) => s + v.fee, 0) + window.AD.getTasks().filter(t => t.status !== 'Done').reduce((s, t) => s + t.fee, 0);
  const jobs = window.AD.payouts.length;
  const avg = Math.round(paid / jobs);

  return (
    <div className="page">
      <PageHeader title="Earnings" sub="Your field fees — released by Prime Realty through escrow as you complete each job." />
      <div className="earn-banner" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="lbl">Paid this week</div>
            <div className="amt">{money(paid)}</div>
            <div className="cpill"><Icon name="lock" />{money(pending)} pending release</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="lbl">Jobs completed</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, marginTop: 4 }}>{jobs}</div>
            <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>avg {money(avg)} / job</div>
          </div>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="wallet" tone="green" label="Paid (wk)" value={moneyShort(paid)} money foot={<span className="stat-delta up"><Icon name="check" />Cleared</span>} />
        <Stat icon="lock" tone="escrow" label="Pending" value={moneyShort(pending)} money foot={<span className="stat-delta"><Icon name="clock" />On completion</span>} />
        <Stat icon="trend" tone="info" label="Avg / job" value={moneyShort(avg)} money foot={<span className="stat-delta">across {jobs} jobs</span>} />
      </div>

      <div className="card card-pad">
        <div className="section-head"><h3>Payout history</h3><button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }}><Icon name="download" />Statement</button></div>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Job</th><th>Date</th><th className="money">Fee</th><th>Status</th></tr></thead>
            <tbody>
              {window.AD.payouts.map(p => (
                <tr key={p.id}>
                  <td data-label="Job" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.label}</td>
                  <td data-label="Date" className="msg-snip">{p.date}</td>
                  <td data-label="Fee" className="money" style={{ fontWeight: 600 }}>{money(p.amount)}</td>
                  <td data-label="Status"><Chip kind="paid">Paid</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */
function Messages({ ctx }) {
  const [sel, setSel] = useState(window.AD.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.AD.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.AD.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() {
    const txt = (drafts[sel] || '').trim(); if (!txt) return;
    setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] }));
    setDrafts(d => ({ ...d, [sel]: '' }));
  }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Stay in sync with your brokerage, leads and support." />
      <div className="chat">
        <div className="thread-list">
          {window.AD.threads.map(th => (
            <div key={th.id} className={"thread" + (sel === th.id ? " sel" : "")} onClick={() => setSel(th.id)}>
              <Avatar name={th.name} color={th.role === 'Support' ? 'info' : th.role.startsWith('Realtor') ? 'gold' : null} />
              <div className="msg-meta"><div className="msg-name">{th.name}{th.unread ? <span className="badge" style={{ background: 'var(--error)', color: '#fff', fontSize: '.6rem', padding: '0 5px', borderRadius: 99 }}>{th.unread}</span> : null}</div><div className="msg-snip">{th.last}</div></div>
              <span className="msg-time">{th.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={t.name} color={t.role === 'Support' ? 'info' : t.role.startsWith('Realtor') ? 'gold' : null} />
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

/* ---------------- Settings ---------------- */
function Settings({ ctx }) {
  const [avail, setAvail] = useState({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false });
  const [notif, setNotif] = useState({ viewings: true, tasks: true, leads: true, payouts: true });
  const days = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']];
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your profile, availability and payouts." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Tobi Adeniyi" size="lg" color="info" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Tobi Adeniyi</span><span className="avatar-role">Field Agent · Prime Realty</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={86} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Tobi Adeniyi" /></Field>
          <Field label="Brokerage"><input className="input" defaultValue="Prime Realty" disabled /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0021" /></div></Field>
          <Field label="Base location"><select className="select"><option>Lagos — Mainland</option><option>Lagos — Island</option><option>Abuja</option></select></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Availability</h3>
        <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 0 }}>Days you can be assigned viewings and field tasks.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {days.map(([k, lbl]) => <button key={k} className={"toggle-pill" + (avail[k] ? ' on' : '')} onClick={() => setAvail(a => ({ ...a, [k]: !a[k] }))} style={{ padding: '8px 16px' }}>{lbl}</button>)}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Payout &amp; verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 09 May 2026' : 'Not verified — required to claim work, log jobs or get paid'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
        {[['Payout account', ctx.verified ? 'Kuda · ****3310' : 'Verify identity first', 'verified'], ['Agent accreditation', 'Verified by Prime Realty', 'verified']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div>{ctx.verified ? <Vbadge state="verified" /> : <Vbadge state="pending" />}</div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['viewings', 'Viewing assignments', 'When a viewing is assigned to you'], ['tasks', 'New tasks', 'Field jobs from the brokerage'], ['leads', 'Lead follow-ups', 'Reminders to contact assigned leads'], ['payouts', 'Payouts', 'When a field fee is released']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Earnings, Messages, Settings });
