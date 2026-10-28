/* Ilé Buyer — Make Offer, Financing, Transactions/Escrow, Documents, Messages, Settings */

function MakeOffer({ ctx, id }) {
  const p = window.BD.find(id) || window.BD.listings[0];
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [amount, setAmount] = useState(String(Math.round(p.price * 0.95)));
  const [financing, setFinancing] = useState('Mortgage');
  const [closing, setClosing] = useState('6 weeks');
  const [note, setNote] = useState('');
  const amt = Number(String(amount).replace(/[^\d]/g, ''));
  const pct = p.price ? Math.round((amt / p.price) * 100) : 0;

  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: 560 }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
          <div className="status-badge ok" style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Icon name="check" style={{ width: 38, height: 38 }} /></div>
          <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Offer submitted</h2>
          <p className="page-sub" style={{ marginBottom: 20 }}>Your offer of <b>{money(amt)}</b> for {p.title} has been sent to {p.owner.name}. You'll be notified the moment they respond.</p>
          <div className="trust-callout" style={{ textAlign: 'left', marginBottom: 20 }}><Icon name="lock" /><p>No money moves yet. If your offer is accepted, your deposit goes into <b>escrow</b> — released only when the title is verified.</p></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button className="btn btn-secondary" onClick={() => ctx.go('offers')}>Track offer</button><button className="btn btn-primary" onClick={() => ctx.go('discover')}>Keep browsing</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('details', p.id)}><Icon name="arrowLeft" />Back to listing</span>
      <PageHeader title="Make an offer" sub={p.title + ' · ' + p.area + ', ' + p.city} />
      <div className="card card-pad">
        {step === 0 && <div>
          <h3 className="section-head" style={{ display: 'block' }}>Your offer</h3>
          <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>Asking price</span>
            <span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{money(p.price)}</span>
          </div>
          <Field label="Offer amount" req hint={amt ? pct + '% of asking price' : 'Enter a whole number in Naira'}>
            <div className="input-group"><span className="prefix">₦</span><input className="input" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          </Field>
          <Field label="How will you pay?">
            <div style={{ display: 'flex', gap: 10 }}>{['Mortgage', 'Cash', 'Part-exchange'].map(m => (
              <button key={m} className={"toggle-pill" + (financing === m ? ' on' : '')} onClick={() => setFinancing(m)} style={{ flex: 1, justifyContent: 'center' }}>{m}</button>
            ))}</div>
          </Field>
        </div>}

        {step === 1 && <div>
          <h3 className="section-head" style={{ display: 'block' }}>Terms</h3>
          <Field label="Preferred closing time">
            <select className="select" value={closing} onChange={e => setClosing(e.target.value)}><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option><option>12 weeks</option></select>
          </Field>
          <Field label="Conditions (optional)">
            <textarea className="textarea" rows="3" placeholder="e.g. subject to structural survey and clear title verification" value={note} onChange={e => setNote(e.target.value)}></textarea>
          </Field>
          <div className="trust-callout"><Icon name="info" style={{ color: 'var(--info)' }} /><p>Offers with verified financing and a confirmed source of funds are <b>3× more likely</b> to be accepted.</p></div>
        </div>}

        {step === 2 && <div>
          <h3 className="section-head" style={{ display: 'block' }}>Review &amp; submit</h3>
          <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none', marginBottom: 14 }}>
            {[['Property', p.title], ['Asking price', money(p.price)], ['Your offer', money(amt) + ' (' + pct + '%)'], ['Financing', financing], ['Closing', closing], ['Conditions', note || 'None']].map(r => (
              <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--ink-100)', gap: 12 }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', flex: 'none' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', textAlign: 'right' }}>{r[1]}</span></div>
            ))}
          </div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', font: 'var(--text-sm)', color: 'var(--ink-700)' }}><input type="checkbox" style={{ marginTop: 3 }} defaultChecked />I understand this is a binding offer subject to title verification and the conditions above.</label>
        </div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--ink-100)' }}>
          <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}><Icon name="arrowLeft" />Back</button>
          {step < 2
            ? <button className="btn btn-primary" disabled={step === 0 && !amt} onClick={() => setStep(s => s + 1)}>Continue<Icon name="arrowRight" /></button>
            : <button className="btn btn-primary" onClick={() => setSubmitted(true)}><Icon name="handshake" />Submit offer</button>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Financing / Mortgage calculator ---------------- */
function Financing({ ctx }) {
  const [price, setPrice] = useState(95000000);
  const [downPct, setDownPct] = useState(25);
  const [rate, setRate] = useState(18);
  const [years, setYears] = useState(20);

  const down = Math.round(price * downPct / 100);
  const loan = price - down;
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r > 0 ? Math.round(loan * r / (1 - Math.pow(1 + r, -n))) : Math.round(loan / n);
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - loan;

  return (
    <div className="page">
      <PageHeader title="Financing" sub="Estimate your mortgage and see what you can comfortably afford." />
      <div className="calc-grid">
        <div className="card card-pad">
          <h3 className="section-head" style={{ display: 'block' }}>Mortgage calculator</h3>

          <div className="range-field">
            <div className="rf-head"><span className="rf-label">Property price</span><span className="rf-val">{money(price)}</span></div>
            <input type="range" className="slider" min="20000000" max="450000000" step="5000000" value={price} onChange={e => setPrice(+e.target.value)} />
          </div>
          <div className="range-field">
            <div className="rf-head"><span className="rf-label">Down payment</span><span className="rf-val">{downPct}% · {moneyShort(down)}</span></div>
            <input type="range" className="slider" min="10" max="60" step="1" value={downPct} onChange={e => setDownPct(+e.target.value)} />
          </div>
          <div className="range-field">
            <div className="rf-head"><span className="rf-label">Interest rate (APR)</span><span className="rf-val">{rate}%</span></div>
            <input type="range" className="slider" min="10" max="30" step="0.5" value={rate} onChange={e => setRate(+e.target.value)} />
          </div>
          <div className="range-field" style={{ marginBottom: 0 }}>
            <div className="rf-head"><span className="rf-label">Loan term</span><span className="rf-val">{years} years</span></div>
            <input type="range" className="slider" min="5" max="30" step="1" value={years} onChange={e => setYears(+e.target.value)} />
          </div>

          <hr className="divider" style={{ margin: '22px 0 18px' }} />
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div className="donut" style={{ '--val': 100 - downPct, '--color': 'var(--escrow)', width: 108, height: 108 }}><div className="inner" style={{ width: 78, height: 78 }}><div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink-900)' }}>{100 - downPct}%</div><div style={{ font: 'var(--text-micro)', color: 'var(--ink-500)' }}>financed</div></div></div></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '6px 0' }}><span style={{ color: 'var(--ink-500)' }}>Loan amount</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{money(loan)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '6px 0' }}><span style={{ color: 'var(--ink-500)' }}>Total interest</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{money(totalInterest)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '6px 0' }}><span style={{ color: 'var(--ink-500)' }}>Total repayable</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{money(totalPaid)}</span></div>
            </div>
          </div>
        </div>

        <div className="calc-result">
          <div className="big-lbl">Estimated monthly repayment</div>
          <div className="big">{money(monthly)}</div>
          <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.8)' }}>over {years} years at {rate}% APR</div>
          <div className="calc-breakdown">
            <div className="cb-row"><span className="cb-k">Property price</span><span className="cb-v">{moneyShort(price)}</span></div>
            <div className="cb-row"><span className="cb-k">Down payment ({downPct}%)</span><span className="cb-v">{moneyShort(down)}</span></div>
            <div className="cb-row"><span className="cb-k">Amount financed</span><span className="cb-v">{moneyShort(loan)}</span></div>
            <div className="cb-row"><span className="cb-k">Payments</span><span className="cb-v">{n} months</span></div>
          </div>
          <button className="btn btn-gold btn-lg btn-block" style={{ marginTop: 22 }} onClick={() => ctx.toast('Pre-approval request sent')}><Icon name="bank" />Get pre-approved</button>
          <p style={{ font: 'var(--text-micro)', color: 'rgba(255,255,255,.65)', marginTop: 12, textAlign: 'center' }}>Estimate only. Final terms depend on your lender and credit assessment.</p>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: 24 }}>
        {[['bank', 'Partner banks', 'Compare mortgage rates from verified Nigerian lenders.'], ['shieldCheck', 'Verified financing', 'Boost your offer with a confirmed pre-approval letter.'], ['lock', 'Escrow-backed', 'Down payments are held safely until your title clears.']].map(c => (
          <div key={c[1]} className="card card-pad">
            <div className="feed-ic" style={{ background: 'var(--green-50)', color: 'var(--primary)', marginBottom: 12 }}><Icon name={c[0]} /></div>
            <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)', marginBottom: 4 }}>{c[1]}</div>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', margin: 0 }}>{c[2]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Transactions (list) ---------------- */
function Transactions({ ctx }) {
  const txs = window.BD.transactions;
  const inEscrow = txs.filter(t => t.stage !== 'Completed');
  const totalHeld = inEscrow.reduce((s, t) => s + t.held, 0);
  return (
    <div className="page">
      <PageHeader title="Transactions" sub="Every home you're buying or have bought through Ilé — open any one to track its escrow." />
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="layers" tone="escrow" label="In escrow" value={inEscrow.length} foot={<span className="stat-delta">{moneyShort(totalHeld)} held</span>} />
        <Stat icon="check" tone="green" label="Completed" value={txs.filter(t => t.stage === 'Completed').length} foot={<span className="stat-delta">homes acquired</span>} />
        <Stat icon="wallet" tone="info" label="Total purchased" value={moneyShort(txs.reduce((s, t) => s + t.amount, 0))} money foot={<span className="stat-delta">lifetime via Ilé</span>} />
      </div>
      <div className="grid" style={{ gap: 12 }}>
        {txs.map(tx => {
          const p = tx.prop || window.BD.find(tx.listingId);
          const done = tx.milestones.filter(s => s.state === 'done').length;
          const total = tx.milestones.length;
          const pct = Math.round(done / total * 100);
          const completed = tx.stage === 'Completed';
          return (
            <div key={tx.id} className="issue-card" style={{ alignItems: 'stretch' }} onClick={() => ctx.go('transactionDetail', tx.id)}>
              <div className="issue-ic" style={{ background: completed ? 'var(--green-50)' : 'var(--escrow-bg)', color: completed ? 'var(--primary)' : 'var(--escrow-text)' }}><Icon name={completed ? 'key' : 'lock'} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>
                  <Chip kind={completed ? 'paid' : 'escrow'}>{tx.stage}</Chip>
                </div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" style={{ width: 14, height: 14 }} />{p.area}, {p.city} · Seller: {tx.seller}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>{completed ? 'Purchase price' : 'Held in escrow'}</div>
                    <span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{money(completed ? tx.amount : tx.held)}</span>
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
  const tx = window.BD.findTx(id) || window.BD.transactions[0];
  const p = tx.prop || window.BD.find(tx.listingId);
  const [steps, setSteps] = useState(tx.milestones.map(s => ({ ...s })));
  const activeIdx = steps.findIndex(s => s.state === 'active');

  function advance() {
    setSteps(prev => {
      const i = prev.findIndex(s => s.state === 'active');
      if (i < 0) return prev;
      const next = prev.map((s, idx) => idx === i ? { ...s, state: 'done', date: '30 May 2026' } : s);
      if (next[i + 1]) next[i + 1] = { ...next[i + 1], state: 'active', date: 'In progress' };
      return next;
    });
    ctx.toast('Milestone confirmed');
  }

  const allDone = activeIdx < 0;

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('transactions')}><Icon name="arrowLeft" />All transactions</span>
      <PageHeader title="Transaction" sub="Your purchase, protected from deposit to ownership transfer." />

      <div className="funds-banner" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="lbl">Held in escrow</div>
            <div className="amt">{money(tx.held)}</div>
            <div className="lock-row"><Icon name="lock" />{p.title} · {p.area}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="lbl">Purchase price</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, marginTop: 4 }}>{money(tx.amount)}</div>
            <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>Seller: {tx.seller}</div>
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
        {allDone && <div className="trust-callout" style={{ marginTop: 18 }}><Icon name="key" style={{ color: 'var(--primary)' }} /><p><b>Congratulations — the home is yours.</b> Funds have been released to the seller and your Certificate of Occupancy has been issued.</p></div>}
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <h3 className="section-head" style={{ display: 'block' }}>Transaction details</h3>
          {[['Reference', 'GRT-TXN-' + tx.id.toUpperCase()], ['Property', p.title], ['Purchase price', money(tx.amount)], ['Deposit in escrow', money(tx.held)], ['Balance due', money(tx.amount - tx.held)], ['Stage', tx.stage], ['Started', tx.started]].map(r => (
            <div key={r[0]} className="settings-row" style={{ padding: '11px 0' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', fontFamily: /price|deposit|balance|reference/i.test(r[0]) ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>
          ))}
        </div>
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Documents</h3>
            {window.BD.documents.slice(0, 3).map(d => (
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
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 0 }}>Your escrow officer is on hand at every step of the transfer.</p>
            <button className="btn btn-secondary btn-block" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message escrow officer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Documents ---------------- */
function BuyDocuments({ ctx }) {
  const [verifying, setVerifying] = useState(null);
  return (
    <div className="page">
      <PageHeader title="Documents" sub="Your secure vault — offers, escrow agreements and title documents." actions={<button className="btn btn-secondary"><Icon name="download" />Download all</button>} />
      <div className="grid cols-2">
        {window.BD.documents.map(d => (
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
function BuyMessages({ ctx }) {
  const [sel, setSel] = useState(window.BD.threads[0].id);
  const [drafts, setDrafts] = useState({});
  const [msgs, setMsgs] = useState(() => { const o = {}; window.BD.threads.forEach(t => o[t.id] = t.messages.slice()); return o; });
  const t = window.BD.threads.find(x => x.id === sel);
  const bodyRef = useRef(null);
  function send() {
    const txt = (drafts[sel] || '').trim(); if (!txt) return;
    setMsgs(m => ({ ...m, [sel]: [...m[sel], { me: true, text: txt, t: 'Now' }] }));
    setDrafts(d => ({ ...d, [sel]: '' }));
  }
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, sel]);
  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Messages" sub="Chat with sellers, agents and your escrow officer — all verified." />
      <div className="chat">
        <div className="thread-list">
          {window.BD.threads.map(th => (
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

/* ---------------- Settings ---------------- */
function BuySettings({ ctx }) {
  const [notif, setNotif] = useState({ offers: true, viewings: true, messages: true, pricedrops: true, marketing: false });
  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <PageHeader title="Settings" sub="Manage your profile, security and notifications." />
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Profile</h3>
        <div className="avatar-block" style={{ marginBottom: 18 }}><Avatar name="Olu Adebayo" size="lg" color="info" /><div className="avatar-meta"><span className="avatar-name" style={{ fontSize: '1.05rem' }}>Olu Adebayo</span><span className="avatar-role">Buyer</span></div><div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><Vbadge state={ctx.verified ? 'verified' : 'unverified'} />{ctx.verified && <TrustRing val={88} size={44} />}</div></div>
        <div className="grid cols-2">
          <Field label="Full name"><input className="input" defaultValue="Olu Adebayo" /></Field>
          <Field label="Email"><input className="input" defaultValue="olu.adebayo@example.com" /></Field>
          <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" defaultValue="800 000 0022" /></div></Field>
          <Field label="Buying in"><select className="select"><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => ctx.toast('Profile saved')}>Save changes</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-head" style={{ display: 'block' }}>Security &amp; verification</h3>
        <div className="settings-row">
          <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Identity verification</div><div className="msg-snip">{ctx.verified ? 'NIN verified · 09 May 2026' : 'Not verified — required to make offers, pay or message sellers'}</div></div>
          {ctx.verified
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Vbadge state="verified" /><button className="btn btn-ghost btn-sm" onClick={ctx.resetVerify}>Reset (demo)</button></div>
            : <button className="btn btn-primary btn-sm" onClick={ctx.openVerify}><Icon name="shieldCheck" />Verify</button>}
        </div>
        {[['Source of funds', ctx.verified ? 'Confirmed for offers up to ₦150M' : 'Verify identity first', 'verified'], ['Two-factor authentication', 'SMS to +234 800 ••• 0000', 'on'], ['Password', 'Last changed 2 months ago', 'change']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div>{r[2] === 'verified' ? (ctx.verified ? <Vbadge state="verified" /> : <Vbadge state="pending" />) : r[2] === 'on' ? <Chip kind="paid">Enabled</Chip> : <button className="btn btn-secondary btn-sm">Change</button>}</div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Notifications</h3>
        {[['offers', 'Offer updates', 'Counter-offers and acceptances'], ['viewings', 'Viewing reminders', 'Before each scheduled viewing'], ['messages', 'New messages', 'Sellers, agents & escrow officer'], ['pricedrops', 'Price drops', 'On homes in your watchlist'], ['marketing', 'New listings', 'Homes matching your search']].map(r => (
          <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</div><div className="msg-snip">{r[2]}</div></div>
            <button className={"toggle-pill" + (notif[r[0]] ? " on" : "")} onClick={() => setNotif(n => ({ ...n, [r[0]]: !n[r[0]] }))}><span className="sw"></span></button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MakeOffer, Financing, Transactions, TransactionDetail, BuyDocuments, BuyMessages, BuySettings });
