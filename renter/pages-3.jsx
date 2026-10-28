/* Ilé Renter — Payments, Escrow Pay Flow, Maintenance */

function Payments({ ctx }) {
  const L = window.RD.lease;
  const cd = (() => { const diff = Math.max(0, new Date(L.nextDue) - Date.now()); return Math.floor(diff / 86400000); })();
  return (
    <div className="page">
      <PageHeader title="Payments" sub="Pay rent securely through escrow and track your history." />
      <div className="dash-grid">
        <div>
          <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--green-700), var(--green-600))', color: '#fff', marginBottom: 20, border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--green-200)', fontWeight: 700 }}>Next rent due</div>
                <div className="money" style={{ fontSize: '2.2rem', fontWeight: 700, margin: '6px 0' }}>{money(L.nextAmount)}</div>
                <div className="addr" style={{ color: 'rgba(255,255,255,.8)', font: 'var(--text-sm)' }}>Due 01 Aug 2026 · in {cd} days</div></div>
              <span className="chip chip--due" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}><span className="dot" style={{ background: 'var(--gold-400)' }}></span>Upcoming</span>
            </div>
            <button className="btn btn-gold btn-lg" style={{ marginTop: 18 }} onClick={() => ctx.requireVerified(() => ctx.go('pay'))}><Icon name="lock" />Pay via escrow</button>
          </div>

          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block' }}>Payment history</h3>
            {window.RD.payments.map(p => (
              <div key={p.id} className="settings-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="feed-ic" style={{ background: p.status === 'paid' ? 'var(--success-bg)' : 'var(--warning-bg)', color: p.status === 'paid' ? 'var(--success)' : 'var(--warning-text)' }}><Icon name={p.status === 'paid' ? 'check' : 'clock'} /></div>
                  <div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{p.period}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{p.date} · {p.method} · {p.ref}</div></div>
                </div>
                <div style={{ textAlign: 'right' }}><div className="money" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{money(p.amount)}</div><Chip kind={p.status === 'paid' ? 'paid' : 'due'}>{p.status === 'paid' ? 'Paid' : 'Due'}</Chip></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="escrow-explainer" style={{ marginBottom: 20 }}>
            <div className="chip chip--escrow" style={{ marginBottom: 12 }}><span className="dot"></span>How escrow protects you</div>
            <div className="escrow">
              {[['You pay into escrow', 'Ilé holds your rent securely — the landlord can’t touch it yet.'], ['Confirm conditions', 'You confirm the home is as agreed and you’ve moved in.'], ['Funds released', 'Only then is rent released to your verified landlord.']].map((s, i) => (
                <div key={i} className="escrow-step escrow-step--done"><div className="escrow-rail"><div className="escrow-node">{i + 1}</div><div className="escrow-line"></div></div><div className="escrow-body"><div className="escrow-title">{s[0]}</div><div className="escrow-desc">{s[1]}</div></div></div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Need a receipt?</h3>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 0 }}>All paid transactions have downloadable receipts in your document vault.</p>
            <button className="btn btn-secondary btn-block" onClick={() => ctx.go('documents')}><Icon name="doc" />Open document vault</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Escrow Pay Flow ---------------- */
function PayFlow({ ctx }) {
  const L = window.RD.lease;
  const [step, setStep] = useState(0); // 0 summary, 1 method, 2 escrow, 3 processing, 4 success
  const [method, setMethod] = useState('transfer');
  const methods = [['transfer', 'bank', 'Bank Transfer', 'Pay from any Nigerian bank'], ['card', 'card', 'Debit Card', 'Visa, Mastercard, Verve'], ['ussd', 'mobile', 'USSD', 'Dial a code — works offline']];

  useEffect(() => { if (step === 3) { const t = setTimeout(() => setStep(4), 2600); return () => clearTimeout(t); } }, [step]);

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('payments')}><Icon name="arrowLeft" />Back to payments</span>
      <div className="card card-pad">
        {step === 0 && <div>
          <h2 className="page-title" style={{ fontSize: '1.4rem' }}>Confirm your payment</h2>
          <p className="page-sub" style={{ marginBottom: 18 }}>Annual rent for {L.title}</p>
          <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none', marginBottom: 16 }}>
            {[['Annual rent', money(L.rent)], ['Ilé service fee', money(0)], ['Escrow protection', 'Included']].map(r => <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', font: 'var(--text-sm)', color: 'var(--ink-600)' }}><span>{r[0]}</span><span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</span></div>)}
            <hr className="divider" style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>Total</span><span className="money" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink-900)' }}>{money(L.rent)}</span></div>
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep(1)}>Choose payment method<Icon name="arrowRight" /></button>
        </div>}

        {step === 1 && <div>
          <h2 className="page-title" style={{ fontSize: '1.4rem' }}>Payment method</h2>
          <p className="page-sub" style={{ marginBottom: 18 }}>Choose how you’d like to pay {money(L.rent)}.</p>
          {methods.map(m => (
            <div key={m[0]} className={"pay-method" + (method === m[0] ? " sel" : "")} onClick={() => setMethod(m[0])}>
              <div className="pm-ic"><Icon name={m[1]} /></div><div className="pm-meta"><div className="pm-name">{m[2]}</div><div className="pm-sub">{m[3]}</div></div><div className="radio-dot"></div>
            </div>
          ))}
          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 14 }} onClick={() => setStep(2)}>Continue<Icon name="arrowRight" /></button>
        </div>}

        {step === 2 && <div>
          <div className="chip chip--escrow" style={{ marginBottom: 12 }}><span className="dot"></span>Escrow protected</div>
          <h2 className="page-title" style={{ fontSize: '1.4rem' }}>Your money is protected</h2>
          <p className="page-sub" style={{ marginBottom: 18 }}>Here’s exactly what happens to your {money(L.rent)}.</p>
          <div className="escrow">
            {[['done', 'You pay into Ilé Escrow', 'Funds are held by our licensed escrow partner — not the landlord.'], ['active', 'Held securely', 'The landlord is notified but cannot access the money yet.'], ['todo', 'You confirm move-in', 'Confirm the home matches what was agreed.'], ['todo', 'Released to landlord', 'Only then does the rent move to your verified landlord.']].map((s, i) => (
              <div key={i} className={"escrow-step escrow-step--" + s[0]}><div className="escrow-rail"><div className="escrow-node">{s[0] === 'done' ? <Icon name="check" /> : i + 1}</div><div className="escrow-line"></div></div><div className="escrow-body"><div className="escrow-title">{s[1]}</div><div className="escrow-desc">{s[2]}</div></div></div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }} onClick={() => setStep(3)}><Icon name="lock" />Pay {money(L.rent)} into escrow</button>
        </div>}

        {step === 3 && <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner-lg" style={{ margin: '0 auto 20px' }}></div>
          <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Processing payment…</h2>
          <p className="page-sub">Securing your funds in escrow. Please don’t close this screen.</p>
        </div>}

        {step === 4 && <div style={{ textAlign: 'center' }}>
          <div className="status-badge ok" style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Icon name="check" style={{ width: 38, height: 38 }} /></div>
          <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Payment held in escrow</h2>
          <p className="page-sub" style={{ marginBottom: 20 }}>{money(L.rent)} is secured. We’ve notified {L.landlord}. Confirm move-in to release the funds.</p>
          <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none', textAlign: 'left', marginBottom: 18 }}>
            {[['Amount', money(L.rent)], ['Status', 'Held in escrow'], ['Reference', 'GRT-PAY-20614'], ['Date', '29 May 2026']].map(r => <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', font: 'var(--text-sm)' }}><span style={{ color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ fontWeight: 600, color: 'var(--ink-900)', fontFamily: r[0] === 'Amount' || r[0] === 'Reference' ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => ctx.go('documents')}><Icon name="download" />Receipt</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={() => ctx.go('payments')}>Done</button></div>
        </div>}
      </div>
    </div>
  );
}

/* ---------------- Maintenance ---------------- */
const MAINT_STAGES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
const CATEGORIES = ['Plumbing', 'Electrical / HVAC', 'Appliances', 'Security', 'Structural', 'Pest Control', 'Other'];

function Maintenance({ ctx }) {
  const [reporting, setReporting] = useState(false);
  const [sel, setSel] = useState(null);
  const [items, setItems] = useState(window.RD.maintenance);
  const [form, setForm] = useState({ category: 'Plumbing' });
  const [photo, setPhoto] = useState(false);

  function submit() {
    const id = 'm' + (items.length + 1);
    setItems([{ id, title: form.title || 'New issue', category: form.category, status: 'Submitted', created: '29 May 2026', vendor: 'Awaiting assignment', desc: form.desc || '', photos: photo ? 1 : 0 }, ...items]);
    setReporting(false); setForm({ category: 'Plumbing' }); setPhoto(false); ctx.toast('Issue reported');
  }

  if (sel) {
    const m = items.find(i => i.id === sel);
    const stageIdx = MAINT_STAGES.indexOf(m.status);
    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <span className="link" style={{ marginBottom: 14 }} onClick={() => setSel(null)}><Icon name="arrowLeft" />All issues</span>
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div><h2 className="page-title" style={{ fontSize: '1.4rem' }}>{m.title}</h2><div className="page-sub">{m.category} · Reported {m.created}</div></div>
            <Chip kind={m.status === 'Resolved' ? 'resolved' : m.status === 'In Progress' ? 'progress' : 'due'}>{m.status}</Chip>
          </div>
          <div className="track" style={{ margin: '28px 0' }}>
            {MAINT_STAGES.map((s, i) => (
              <div key={s} className={"track-node" + (i < stageIdx ? " done" : i === stageIdx ? " active" : "")}><div className="track-line"></div><div className="track-dot">{i < stageIdx ? <Icon name="check" /> : i === stageIdx ? <span style={{ width: 7, height: 7, borderRadius: 99, background: 'currentColor' }}></span> : i + 1}</div><div className="track-label">{s}</div></div>
            ))}
          </div>
          <hr className="divider" />
          <div style={{ marginTop: 16 }}><div className="label-cap" style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700, marginBottom: 6 }}>Description</div><p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', marginTop: 0 }}>{m.desc || 'No description provided.'}</p></div>
          <div className="grid cols-2" style={{ marginTop: 12 }}>
            <div><div className="label-cap" style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700, marginBottom: 6 }}>Assigned vendor</div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{m.vendor}</div></div>
            <div><div className="label-cap" style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700, marginBottom: 6 }}>Photos</div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{m.photos} attached</div></div>
          </div>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 20 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message about this issue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Maintenance" sub="Report issues and track them from request to resolution." actions={<button className="btn btn-primary" onClick={() => setReporting(r => !r)}><Icon name={reporting ? 'x' : 'plus'} />{reporting ? 'Cancel' : 'Report an issue'}</button>} />

      {reporting && (
        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <h3 className="section-head" style={{ display: 'block' }}>Report a new issue</h3>
          <Field label="Issue title" req><input className="input" placeholder="e.g. Leaking kitchen tap" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Category"><select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Description"><textarea className="textarea" rows="3" placeholder="Describe the problem and when it started…" value={form.desc || ''} onChange={e => setForm({ ...form, desc: e.target.value })}></textarea></Field>
          <Field label="Photo (optional)">{photo ? <div className="file-row"><div className="file-ic"><Icon name="camera" /></div><div className="file-meta"><div className="file-name">issue-photo.jpg</div><div className="file-sub"><Icon name="check" style={{ width: 14, height: 14, color: 'var(--success)' }} />Attached</div></div></div> : <div className="upload" style={{ padding: 18 }} onClick={() => setPhoto(true)}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)' }}><Icon name="camera" style={{ width: 17, height: 17, verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} />Add a photo</div></div>}</Field>
          <button className="btn btn-primary" disabled={!form.title} onClick={submit}><Icon name="send" />Submit issue</button>
        </div>
      )}

      {items.length ? (
        <div className="grid" style={{ gap: 12 }}>
          {items.map(m => {
            const stageIdx = MAINT_STAGES.indexOf(m.status);
            return (
              <div key={m.id} className="issue-card" onClick={() => setSel(m.id)}>
                <div className="issue-ic"><Icon name="wrench" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{m.title}</div><Chip kind={m.status === 'Resolved' ? 'resolved' : m.status === 'In Progress' ? 'progress' : 'due'}>{m.status}</Chip></div>
                  <div className="msg-snip" style={{ marginTop: 2 }}>{m.category} · {m.vendor} · {m.created}</div>
                  <div className="track" style={{ marginTop: 12, maxWidth: 420 }}>
                    {MAINT_STAGES.map((s, i) => <div key={s} className={"track-node" + (i < stageIdx ? " done" : i === stageIdx ? " active" : "")}><div className="track-line"></div><div className="track-dot" style={{ width: 20, height: 20 }}>{i < stageIdx ? <Icon name="check" style={{ width: 11, height: 11 }} /> : null}</div><div className="track-label" style={{ fontSize: '.6rem' }}>{s}</div></div>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="card"><EmptyState icon="wrench" title="No maintenance issues" desc="When something needs fixing, report it here and track the repair." /></div>}
    </div>
  );
}

Object.assign(window, { Payments, PayFlow, Maintenance });
