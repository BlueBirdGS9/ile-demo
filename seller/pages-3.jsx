/* Ilé Seller — Transactions, Documents, Messages, Settings */

/* ---------------- Transactions (list) ---------------- */
function Transactions({ ctx }) {
  const txs = window.SD.transactions;
  const inEscrow = txs.filter(t => t.stage !== 'Completed');
  const totalProceeds = txs.reduce((s, t) => s + (t.amount - t.fee), 0);
  return (
    <div className="page">
      <PageHeader title="Transactions" sub="Every sale you're closing or have completed through Ilé — open any one to track its escrow." />
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="layers" tone="escrow" label="In escrow" value={inEscrow.length} foot={<span className="stat-delta">{moneyShort(inEscrow.reduce((s, t) => s + t.held, 0))} buyer funds held</span>} />
        <Stat icon="check" tone="green" label="Completed" value={txs.filter(t => t.stage === 'Completed').length} foot={<span className="stat-delta">sales closed</span>} />
        <Stat icon="wallet" tone="info" label="Net proceeds" value={moneyShort(totalProceeds)} money foot={<span className="stat-delta">lifetime via Ilé</span>} />
      </div>
      <div className="grid" style={{ gap: 12 }}>
        {txs.map(tx => {
          const p = tx.prop || window.SD.find(tx.listingId);
          const done = tx.milestones.filter(s => s.state === 'done').length;
          const total = tx.milestones.length;
          const pct = Math.round(done / total * 100);
          const completed = tx.stage === 'Completed';
          const net = tx.amount - tx.fee;
          return (
            <div key={tx.id} className="issue-card" style={{ alignItems: 'stretch' }} onClick={() => ctx.go('transactionDetail', tx.id)}>
              <div className="issue-ic" style={{ background: completed ? 'var(--green-50)' : 'var(--escrow-bg)', color: completed ? 'var(--primary)' : 'var(--escrow-text)' }}><Icon name={completed ? 'check' : 'lock'} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>
                  <Chip kind={completed ? 'paid' : 'escrow'}>{tx.stage}</Chip>
                </div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" style={{ width: 14, height: 14 }} />{p.area}, {p.city} · Buyer: {tx.buyer}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>Net proceeds</div>
                    <span className="money" style={{ fontWeight: 700, color: 'var(--primary)' }}>{money(net)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-micro)', color: 'var(--ink-500)', marginBottom: 5 }}><span>{completed ? 'Completed ' + tx.closed : done + ' of ' + total + ' milestones'}</span><span className="money">{pct}%</span></div>
                    <div style={{ height: 6, borderRadius: 99, background: 'var(--ink-100)', overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: completed ? 'var(--success)' : 'var(--escrow)', borderRadius: 99 }}></div></div>
                  </div>
                  <Icon name="chevronRight" style={{ color: 'var(--ink-400)', flex: 'none' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Transaction detail / Escrow ---------------- */
function TransactionDetail({ ctx, id }) {
  const tx = window.SD.findTx(id) || window.SD.transactions[0];
  const p = tx.prop || window.SD.find(tx.listingId);
  const [steps, setSteps] = useState(tx.milestones.map(s => ({ ...s })));
  const activeIdx = steps.findIndex(s => s.state === 'active');
  const netProceeds = tx.amount - tx.fee;

  function advance() {
    setSteps(prev => {
      const i = prev.findIndex(s => s.state === 'active');
      if (i < 0) return prev;
      const next = prev.map((s, idx) => idx === i ? { ...s, state: 'done', date: '31 May 2026' } : s);
      if (next[i + 1]) next[i + 1] = { ...next[i + 1], state: 'active', date: 'In progress' };
      return next;
    });
    ctx.toast('Milestone confirmed');
  }
  const allDone = activeIdx < 0;

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('transactions')}><Icon name="arrowLeft" />All transactions</span>
      <PageHeader title="Transaction" sub="Your sale, protected from the buyer's deposit to ownership transfer." />

      <div className="proceeds-banner" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="lbl">Net proceeds on completion</div>
            <div className="amt">{money(netProceeds)}</div>
            <div className="cpill"><Icon name="lock" />{money(tx.held)} buyer deposit secured · {p.area}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="lbl">Sale price</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, marginTop: 4 }}>{money(tx.amount)}</div>
            <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>Buyer: {tx.buyer}</div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <div className="section-head"><h3>Escrow milestones</h3><Chip kind={allDone ? 'paid' : 'escrow'}>{allDone ? 'Completed' : 'In escrow'}</Chip></div>
        <Milestones steps={steps} />
        {!allDone && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Next: {steps[activeIdx].title}</div>
              <div className="msg-snip">{steps[activeIdx].desc}</div>
            </div>
            <button className="btn btn-primary" onClick={advance}><Icon name="check" />Confirm &amp; continue</button>
          </div>
        )}
        {allDone && <div className="trust-callout" style={{ marginTop: 18 }}><Icon name="check" style={{ color: 'var(--success)' }} /><p><b>Sale complete.</b> Ownership has transferred to {tx.buyer} and your net proceeds of {money(netProceeds)} have been released from escrow.</p></div>}
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <h3 className="section-head" style={{ display: 'block' }}>Transaction details</h3>
          {[['Reference', 'GRT-SALE-' + tx.id.toUpperCase()], ['Property', p.title], ['Buyer', tx.buyer], ['Sale price', money(tx.amount)], ['Deposit in escrow', money(tx.held)], ['Ilé fee', money(tx.fee)], ['Net proceeds', money(netProceeds)], ['Started', tx.started]].map(r => (
            <div key={r[0]} className="settings-row" style={{ padding: '11px 0' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: /net/i.test(r[0]) ? 'var(--primary)' : 'var(--ink-900)', fontFamily: /price|deposit|fee|proceeds|reference/i.test(r[0]) ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>
          ))}
        </div>
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Documents</h3>
            {window.SD.documents.slice(0, 3).map(d => (
              <div key={d.id} className="msg-row" onClick={() => ctx.go('documents')}>
                <div className="feed-ic" style={{ background: 'var(--green-50)', color: 'var(--primary)' }}><Icon name="doc" /></div>
                <div className="msg-meta"><div className="msg-name">{d.name}</div><div className="msg-snip">{d.type} · {d.size}</div></div>
                {d.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}
              </div>
            ))}
            <button className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={() => ctx.go('documents')}><Icon name="doc" />Open vault</button>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Need help?</h3>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 0 }}>Your escrow officer manages the transfer end to end.</p>
            <button className="btn btn-secondary btn-block" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message escrow officer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Documents ---------------- */
function SellDocuments({ ctx }) {
  const [verifying, setVerifying] = useState(null);
  return (
    <div className="page">
      <PageHeader title="Documents" sub="Your secure vault — titles, sale agreements and escrow records." actions={<button className="btn btn-secondary"><Icon name="download" />Download all</button>} />
      <div className="grid cols-2">
        {window.SD.documents.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-thumb"><Icon name="doc" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div>
              <div className="msg-snip">{d.type} · {d.date} · {d.size}</div>
              <div style={{ marginTop: 6 }}>{verifying === d.id ? <span className="tag"><span className="skeleton" style={{ width: 12, height: 12, borderRadius: 99 }}></span>Verifying…</span> : d.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}</div>
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

/* ---------------- Messages ---------------- */
function SellMessages({ ctx }) {
  const [sel, setSel] = useState(window.SD.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.SD.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.SD.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() {
    const txt = (drafts[sel] || '').trim(); if (!txt) return;
    setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] }));
    setDrafts(d => ({ ...d, [sel]: '' }));
  }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Chat with buyers and your escrow officer — all verified." />
      <div className="chat">
        <div className="thread-list">
          {window.SD.threads.map(th => (
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
function SellSettings({ ctx }) {
  const [notif, setNotif] = useState({ offers: true, messages: true, viewings: true, proceeds: true, marketing: false });
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your profile, payouts and notifications." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Yewande Coker" size="lg" color="gold" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Yewande Coker</span><span className="avatar-role">Seller</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={93} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Yewande Coker" /></Field>
          <Field label="Email"><input className="input" defaultValue="yewande.coker@example.com" /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0026" /></div></Field>
          <Field label="Selling in"><select className="select"><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Payout &amp; verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 09 May 2026' : 'Not verified — required to list, accept offers or get paid'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
        {[['Proceeds payout account', ctx.verified ? 'Zenith Bank · ****6610' : 'Verify identity first', 'verified'], ['Property ownership', ctx.verified ? 'Title deeds verified with registry' : 'Verify identity first', 'verified'], ['Two-factor authentication', 'SMS to +234 803 ••• 2204', 'on']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div>{r[2] === 'verified' ? (ctx.verified ? <Vbadge state="verified" /> : <Vbadge state="pending" />) : <Chip kind="paid">Enabled</Chip>}</div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['offers', 'New offers', 'When a buyer makes or revises an offer'], ['messages', 'New messages', 'Buyers & escrow officer'], ['viewings', 'Viewing requests', 'When a buyer books a viewing'], ['proceeds', 'Escrow & proceeds', 'Milestones and proceeds release'], ['marketing', 'Market insights', 'Pricing trends for your areas']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Transactions, TransactionDetail, SellDocuments, SellMessages, SellSettings });
