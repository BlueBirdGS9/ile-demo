/* Ilé Realtor — Deals, Deal detail, Performance, Messages, Documents, Settings */

function Deals({ ctx }) {
  const released = window.RT.deals.filter(d => d.escrow === 'released').reduce((s, d) => s + window.RT.commission(d), 0);
  const pipeline = window.RT.deals.filter(d => d.escrow !== 'released').reduce((s, d) => s + window.RT.commission(d), 0);
  return (
    <div className="page">
      <PageHeader title="Deals" sub="Every transaction is escrow-backed — your commission releases automatically on completion." />
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="wallet" tone="green" label="Released" value={moneyShort(released)} money foot={<span className="stat-delta up"><Icon name="check" />Cleared to your account</span>} />
        <Stat icon="lock" tone="escrow" label="In escrow" value={moneyShort(pipeline)} money foot={<span className="stat-delta"><Icon name="clock" />Releases on completion</span>} />
        <Stat icon="handshake" tone="gold" label="Active deals" value={window.RT.deals.filter(d => d.stage !== 'Completed').length} foot={<span className="stat-delta">{window.RT.deals.length} total this quarter</span>} />
      </div>

      <div className="grid" style={{ gap: 12 }}>
        {window.RT.deals.map(d => {
          const p = window.RT.findListing(d.listingId);
          return (
            <div key={d.id} className="deal-card" onClick={() => ctx.go('dealDetail', d.id)}>
              <div className="deal-thumb"><span>{p.image}</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>{dealChip(d.stage)}</div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="user" style={{ width: 14, height: 14 }} />Buyer: {d.buyer} · {p.area}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  <div><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>Sale price</div><span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{money(d.salePrice)}</span></div>
                  <div className="comm-tag"><Icon name="wallet" />{money(window.RT.commission(d))} · {d.commissionPct}%</div>
                  {d.escrow === 'released' ? <Chip kind="paid">Commission paid</Chip> : <Chip kind="escrow">Fee in escrow</Chip>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealDetail({ ctx, id }) {
  const d0 = window.RT.findDeal(id) || window.RT.deals[0];
  const p = window.RT.findListing(d0.listingId);
  const comm = window.RT.commission(d0);
  const steps = window.RT.dealMilestones[d0.id] || [
    { key: 'offer', title: 'Offer accepted', desc: money(d0.salePrice), state: 'done', date: d0.started },
    { key: 'deposit', title: 'Deposit in escrow', desc: 'Secured', state: 'done', date: d0.started },
    { key: 'verification', title: 'Title verified', desc: 'Registry', state: 'done', date: d0.started },
    { key: 'final', title: 'Transfer complete', desc: 'Funds released', state: 'done', date: d0.closed },
    { key: 'commission', title: 'Commission released', desc: money(comm), state: 'done', date: d0.closed }
  ];

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('deals')}><Icon name="arrowLeft" />All deals</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><h2 className="page-title" style={{ fontSize: '1.4rem' }}>{p.title}</h2><div className="page-sub" style={{ marginBottom: 0 }}>{p.area}, {p.city} · Buyer: {d0.buyer}</div></div>
              {dealChip(d0.stage)}
            </div>
            <hr className="divider" style={{ margin: '16px 0' }} />
            <h3 className="section-head" style={{ display: 'block' }}>Transaction progress</h3>
            <div className="milestones">
              {steps.map(s => (
                <div key={s.key} className={"ms " + s.state}>
                  <div className="ms-line"></div>
                  <div className="ms-node">{s.state === 'done' ? <Icon name="check" /> : s.state === 'active' ? <Icon name="lock" /> : <Icon name={s.key === 'commission' ? 'wallet' : s.key === 'verification' ? 'shieldCheck' : s.key === 'final' ? 'key' : 'handshake'} />}</div>
                  <div className="ms-title">{s.title}</div>
                  <div className="ms-desc">{s.desc}</div>
                  {s.date && <div className="ms-date">{s.date}</div>}
                </div>
              ))}
            </div>
            {d0.escrow !== 'released' && <div className="trust-callout" style={{ marginTop: 18 }}><Icon name="lock" style={{ color: 'var(--escrow-text)' }} /><p>Your commission of <b>{money(comm)}</b> is locked in escrow and releases automatically the moment ownership transfers — no chasing payment.</p></div>}
            {d0.escrow === 'released' && <div className="trust-callout" style={{ marginTop: 18 }}><Icon name="check" style={{ color: 'var(--success)' }} /><p>Deal completed. Your commission of <b>{money(comm)}</b> was released to your account on {d0.closed}.</p></div>}
          </div>
        </div>

        <div>
          <div className="comm-banner" style={{ marginBottom: 20 }}>
            <div className="lbl">Your commission</div>
            <div className="amt">{money(comm)}</div>
            <div className="pill-row"><span className="cpill"><Icon name="trend" />{d0.commissionPct}% of {moneyShort(d0.salePrice)}</span></div>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Deal summary</h3>
            {[['Reference', 'GRT-DEAL-' + d0.id.toUpperCase()], ['Listing', p.title], ['Buyer', d0.buyer], ['Sale price', money(d0.salePrice)], ['Commission', money(comm) + ' (' + d0.commissionPct + '%)'], ['Started', d0.started], ['Closing', d0.closed]].map(r => (
              <div key={r[0]} className="settings-row" style={{ padding: '11px 0' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', fontFamily: /price|commission|reference/i.test(r[0]) ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>
            ))}
            <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.go('documents')}><Icon name="doc" />View documents</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Performance ---------------- */
function Performance({ ctx }) {
  const released = window.RT.deals.filter(d => d.escrow === 'released').reduce((s, d) => s + window.RT.commission(d), 0);
  const closedLeads = window.RT.leads.filter(l => l.stage === 'Closed').length;
  const totalLeads = window.RT.leads.length;
  const convRate = ((closedLeads / totalLeads) * 100).toFixed(0);
  const avgDays = 34;

  return (
    <div className="page">
      <PageHeader title="Performance" sub="Track your sales, conversion and earnings over time." />
      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="wallet" tone="green" label="Commission YTD" value={moneyShort(released + 24800000)} money foot={<span className="stat-delta up"><Icon name="trend" />+38% YoY</span>} />
        <Stat icon="handshake" tone="gold" label="Deals closed" value="11" foot={<span className="stat-delta">this year</span>} />
        <Stat icon="trend" tone="info" label="Conversion" value={convRate + '%'} foot={<span className="stat-delta up"><Icon name="trend" />Above 22% avg</span>} />
        <Stat icon="clock" tone="escrow" label="Days to close" value={avgDays} foot={<span className="stat-delta">faster than market</span>} />
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <div className="section-head"><h3>Commission earned</h3><span className="msg-snip">Last 6 months · ₦ millions</span></div>
          <BarChart data={window.RT.earnings} fmt={v => '₦' + v + 'M'} />
        </div>
        <div className="card card-pad">
          <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Lead sources</h3></div>
          {window.RT.sources.map(s => (
            <div key={s.cat} className="src-row">
              <span className="src-k">{s.cat}</span>
              <div className="src-track"><div className="src-fill" style={{ width: s.pct + '%' }}></div></div>
              <span className="src-v">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 22 }}>
        <div className="section-head"><h3>Closed deals</h3></div>
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Property</th><th>Buyer</th><th className="money">Sale price</th><th className="money">Commission</th><th>Closed</th><th>Status</th></tr></thead>
            <tbody>
              {window.RT.deals.map(d => {
                const p = window.RT.findListing(d.listingId);
                return (
                  <tr key={d.id} onClick={() => ctx.go('dealDetail', d.id)} style={{ cursor: 'pointer' }}>
                    <td data-label="Property"><div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.area}</div><div className="msg-snip">{p.type}</div></td>
                    <td data-label="Buyer">{d.buyer}</td>
                    <td data-label="Sale price" className="money">{moneyShort(d.salePrice)}</td>
                    <td data-label="Commission" className="money" style={{ color: 'var(--primary)', fontWeight: 700 }}>{moneyShort(window.RT.commission(d))}</td>
                    <td data-label="Closed" className="msg-snip">{d.closed}</td>
                    <td data-label="Status">{dealChip(d.stage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */
function Messages({ ctx }) {
  const [sel, setSel] = useState(window.RT.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.RT.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.RT.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() {
    const txt = (drafts[sel] || '').trim(); if (!txt) return;
    setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] }));
    setDrafts(d => ({ ...d, [sel]: '' }));
  }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Chat with leads, owners and your escrow officer." />
      <div className="chat">
        <div className="thread-list">
          {window.RT.threads.map(th => (
            <div key={th.id} className={"thread" + (sel === th.id ? " sel" : "")} onClick={() => setSel(th.id)}>
              <Avatar name={th.name} color={th.role === 'Support' ? 'info' : th.role.startsWith('Owner') ? 'gold' : null} />
              <div className="msg-meta"><div className="msg-name">{th.name}{th.unread ? <span className="badge" style={{ background: 'var(--error)', color: '#fff', fontSize: '.6rem', padding: '0 5px', borderRadius: 99 }}>{th.unread}</span> : null}</div><div className="msg-snip">{th.last}</div></div>
              <span className="msg-time">{th.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={t.name} color={t.role === 'Support' ? 'info' : t.role.startsWith('Owner') ? 'gold' : null} />
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
  return (
    <div className="page">
      <PageHeader title="Documents" sub="Mandates, offers, titles and commission statements — all in one vault." actions={<button className="btn btn-secondary"><Icon name="download" />Download all</button>} />
      <div className="grid cols-2">
        {window.RT.documents.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-thumb"><Icon name="doc" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div>
              <div className="msg-snip">{d.type} · {d.date} · {d.size}</div>
              <div style={{ marginTop: 6 }}>{d.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="icon-btn" title="Download"><Icon name="download" /></button>
              <button className="icon-btn" title="Copy"><Icon name="copy" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings({ ctx }) {
  const [notif, setNotif] = useState({ leads: true, offers: true, viewings: true, commission: true, marketing: false });
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your brokerage profile, payouts and notifications." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Ngozi Eze" size="lg" color="gold" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Ngozi Eze</span><span className="avatar-role">Realtor · Prime Realty</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={94} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Ngozi Eze" /></Field>
          <Field label="Brokerage"><input className="input" defaultValue="Prime Realty" /></Field>
          <Field label="Email"><input className="input" defaultValue="ngozi.eze@primerealty.ng" /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0024" /></div></Field>
          <Field label="License no."><input className="input" defaultValue="REDAN-LAG-22481" /></Field>
          <Field label="Operating city"><select className="select"><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Payout &amp; verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 09 May 2026' : 'Not verified — required to publish, take on management or close deals'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
        {[['Commission payout account', ctx.verified ? 'GTBank · ****8842' : 'Verify identity first', 'verified'], ['REDAN membership', 'Active · renews Jan 2027', 'verified'], ['Two-factor authentication', 'SMS to +234 803 ••• 9921', 'on']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div>{r[2] === 'verified' ? (ctx.verified ? <Vbadge state="verified" /> : <Vbadge state="pending" />) : <Chip kind="paid">Enabled</Chip>}</div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['leads', 'New leads', 'When a lead is assigned to you'], ['offers', 'Offers', 'When a buyer submits or revises an offer'], ['viewings', 'Viewing requests', 'Booking and reschedule alerts'], ['commission', 'Commission released', 'When escrow releases your fee'], ['marketing', 'Market insights', 'Weekly pricing & demand digest']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Deals, DealDetail, Performance, Messages, Documents, Settings });
