/* Ilé Renter — Saved & Compare, Application, Lease */

function SavedCompare({ ctx }) {
  const saved = ctx.saved.map(id => window.RD.find(id)).filter(Boolean);
  const cmp = ctx.compareList.map(id => window.RD.find(id)).filter(Boolean);
  const rows = [
    ['Price / year', p => money(p.price), true],
    ['Type', p => p.type], ['Location', p => p.area + ', ' + p.city],
    ['Bedrooms', p => p.beds], ['Bathrooms', p => p.baths], ['Floor area', p => p.sqm + ' m²'],
    ['Furnished', p => p.furnished ? 'Yes' : 'No'], ['Pet friendly', p => p.pet ? 'Yes' : 'No'],
    ['Distance', p => p.distance], ['Rating', p => p.rating + ' ★ (' + p.reviews + ')'],
    ['Verified', p => p.verified ? '✓ Verified' : '— Unverified'], ['Owner trust', p => p.owner.trust]
  ];
  const minPrice = Math.min(...cmp.map(p => p.price));
  return (
    <div className="page">
      <PageHeader title="Saved & compare" sub="Shortlist homes you love, then compare them side by side." />

      {cmp.length >= 2 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-head"><h3>Comparing {cmp.length} homes</h3><span className="link" onClick={() => cmp.forEach(p => ctx.toggleCompare(p.id))}>Clear comparison</span></div>
          <div className="compare-wrap">
            <table className="compare-table">
              <thead><tr><th></th>{cmp.map(p => <th key={p.id}><div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{p.title}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{p.area}</div></th>)}</tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r[0]}><th>{r[0]}</th>{cmp.map(p => <td key={p.id} className={r[2] && p.price === minPrice ? 'best' : ''}>{r[1](p)}{r[2] && p.price === minPrice ? ' · best' : ''}</td>)}</tr>
              ))}
              <tr><th></th>{cmp.map(p => <td key={p.id}><button className="btn btn-primary btn-sm" onClick={() => ctx.go('details', p.id)}>View</button></td>)}</tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section-head"><h3>Saved homes ({saved.length})</h3></div>
      {saved.length ? (
        <div className="grid cols-3">{saved.map(p => <PropertyCard key={p.id} p={p} saved onSave={ctx.toggleSave} onOpen={id => ctx.go('details', id)} compare onCompare={ctx.toggleCompare} comparing={ctx.compareList.includes(p.id)} />)}</div>
      ) : (
        <div className="card"><EmptyState icon="bookmark" title="No saved homes yet" desc="Tap the heart on any listing to save it here and compare your favourites." actions={<button className="btn btn-primary btn-sm" onClick={() => ctx.go('discover')}>Browse homes</button>} /></div>
      )}
    </div>
  );
}

/* ---------------- 5-step Application ---------------- */
const APPL_STEPS = [['Property', 'Confirm the home'], ['Personal', 'Your details'], ['Employment', 'Income & work'], ['Documents', 'Upload proof'], ['Review', 'Check & submit']];

function MiniUpload({ label, onDone, done }) {
  const [s, setS] = useState(done ? 'done' : 'idle');
  return s === 'idle'
    ? <div className="upload" style={{ padding: '18px' }} onClick={() => { setS('up'); setTimeout(() => { setS('done'); onDone && onDone(); }, 1100); }}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)' }}><Icon name="download" style={{ width: 17, height: 17, verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} />Upload {label}</div></div>
    : <div className="file-row"><div className="file-ic"><Icon name="file" /></div><div className="file-meta"><div className="file-name">{label}</div><div className="file-sub">{s === 'up' ? 'Uploading…' : <><Icon name="check" style={{ width: 14, height: 14, color: 'var(--success)' }} />Uploaded</>}</div>{s === 'up' && <div className="file-bar"><div className="fill" style={{ width: '100%' }} /></div>}</div>{s === 'done' && <Chip kind="paid">Ready</Chip>}</div>;
}

function Application({ ctx, id }) {
  const p = window.RD.find(id) || window.RD.properties[0];
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [f, setF] = useState({ docs: {} });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const monthly = Math.round(p.price / 12);

  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: 560 }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
          <div className="status-badge ok" style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Icon name="check" style={{ width: 38, height: 38 }} /></div>
          <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Application submitted</h2>
          <p className="page-sub" style={{ marginBottom: 20 }}>Your application for <b>{p.title}</b> is with {p.owner.name}. You’ll be notified when it’s reviewed — typically within 48 hours.</p>
          <div className="trust-callout" style={{ textAlign: 'left', marginBottom: 20 }}><Icon name="lock" /><p>No payment is taken yet. If approved, your first rent goes into <b>escrow</b> — released only after you confirm move-in.</p></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button className="btn btn-secondary" onClick={() => ctx.go('applications')}>View applications</button><button className="btn btn-primary" onClick={() => ctx.go('discover')}>Keep browsing</button></div>
        </div>
      </div>
    );
  }

  const docsCount = Object.values(f.docs).filter(Boolean).length;
  const canNext = [true, f.fullName && f.email, f.employer && f.income, docsCount >= 2, true][step];

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('details', p.id)}><Icon name="arrowLeft" />Back to listing</span>
      <PageHeader title="Rental application" sub={p.title + ' · ' + p.area + ', ' + p.city} />
      <div className="appl-grid">
        <div className="stepper">
          {APPL_STEPS.map((s, i) => (
            <div key={i} className={"step" + (i === step ? " active" : i < step ? " done" : "")}>
              <div className="step-num">{i < step ? <Icon name="check" /> : i + 1}</div>
              <div className="step-meta"><div className="t">{s[0]}</div><div className="d">{s[1]}</div></div>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          {step === 0 && <div>
            <h3 className="section-head" style={{ display: 'block' }}>Confirm the property</h3>
            <div className="pcard" style={{ flexDirection: 'row', maxWidth: '100%' }}>
              <div style={{ width: 160, background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 12px,var(--ink-50) 12px,var(--ink-50) 24px)', display: 'grid', placeItems: 'center', flex: 'none' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--ink-400)' }}>{p.type}</span></div>
              <div className="pcard-body" style={{ flex: 1 }}><div className="pcard-price">{money(p.price)}<span className="per">/year</span></div><div className="pcard-title">{p.title}</div><div className="pcard-loc"><Icon name="mapPin" />{p.area}, {p.city}</div><div style={{ marginTop: 6 }}><Vbadge state={p.verified ? 'verified' : 'unverified'} sm /></div></div>
            </div>
            <div className="grid cols-3" style={{ marginTop: 16 }}>
              <Field label="Move-in date"><input className="input" type="date" defaultValue="2026-07-01" /></Field>
              <Field label="Lease length"><select className="select"><option>12 months</option><option>24 months</option></select></Field>
              <Field label="Occupants"><input className="input" type="number" defaultValue="2" /></Field>
            </div>
          </div>}

          {step === 1 && <div>
            <h3 className="section-head" style={{ display: 'block' }}>Personal information</h3>
            <div className="grid cols-2">
              <Field label="Full name" req><input className="input" placeholder="Adaeze Okonkwo" value={f.fullName || ''} onChange={e => set('fullName', e.target.value)} /></Field>
              <Field label="Email" req><input className="input" type="email" placeholder="you@example.com" value={f.email || ''} onChange={e => set('email', e.target.value)} /></Field>
              <Field label="Phone"><div className="input-group"><span className="prefix">+234</span><input className="input" placeholder="801 234 5678" /></div></Field>
              <Field label="Date of birth"><input className="input" type="date" /></Field>
              <Field label="Current address"><input className="input" placeholder="Street, area, city" /></Field>
              <Field label="Marital status"><select className="select"><option>Single</option><option>Married</option><option>Other</option></select></Field>
            </div>
          </div>}

          {step === 2 && <div>
            <h3 className="section-head" style={{ display: 'block' }}>Employment & income</h3>
            <div className="grid cols-2">
              <Field label="Employer / business" req><input className="input" placeholder="e.g. Paystack" value={f.employer || ''} onChange={e => set('employer', e.target.value)} /></Field>
              <Field label="Job title"><input className="input" placeholder="e.g. Product Designer" /></Field>
              <Field label="Monthly net income" req><div className="input-group"><span className="prefix">₦</span><input className="input" placeholder="950,000" value={f.income || ''} onChange={e => set('income', e.target.value)} /></div></Field>
              <Field label="Employment type"><select className="select"><option>Full-time</option><option>Self-employed</option><option>Contract</option></select></Field>
            </div>
            <Field label="Guarantor name (optional)"><input className="input" placeholder="Full name of guarantor" /></Field>
            <div className="trust-callout"><Icon name="info" style={{ color: 'var(--info)' }} /><p>Most landlords look for annual income of ~3× the rent. Your income is shared only with the landlord, encrypted.</p></div>
          </div>}

          {step === 3 && <div>
            <h3 className="section-head" style={{ display: 'block' }}>Supporting documents</h3>
            <p className="page-sub" style={{ marginTop: 0, marginBottom: 16 }}>Upload at least 2 documents to strengthen your application.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Proof of income (3 payslips)', 'Bank statement (6 months)', 'Employment letter', 'Valid ID (NIN / Passport)'].map((d, i) => <MiniUpload key={d} label={d} done={!!f.docs[i]} onDone={() => set('docs', { ...f.docs, [i]: true })} />)}
            </div>
          </div>}

          {step === 4 && <div>
            <h3 className="section-head" style={{ display: 'block' }}>Review & submit</h3>
            <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none', marginBottom: 14 }}>
              {[['Property', p.title + ' · ' + p.area], ['Annual rent', money(p.price)], ['Applicant', f.fullName || '—'], ['Email', f.email || '—'], ['Employer', f.employer || '—'], ['Monthly income', f.income ? '₦' + f.income : '—'], ['Documents', docsCount + ' uploaded']].map(r => (
                <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--ink-100)' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[1]}</span></div>
              ))}
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', font: 'var(--text-sm)', color: 'var(--ink-700)' }}><input type="checkbox" style={{ marginTop: 3 }} defaultChecked />I confirm the information is accurate and authorise Ilé to verify it.</label>
            <div className="trust-callout" style={{ marginTop: 14 }}><Icon name="lock" /><p>Submitting does not charge you. Payment only happens via <b>escrow</b> after approval.</p></div>
          </div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--ink-100)' }}>
            <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}><Icon name="arrowLeft" />Back</button>
            {step < 4
              ? <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(s => s + 1)}>Continue<Icon name="arrowRight" /></button>
              : <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit application<Icon name="check" /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Lease Management ---------------- */
function Lease({ ctx }) {
  const L = window.RD.lease;
  return (
    <div className="page">
      <PageHeader title="My lease" sub="Your active tenancy agreement and key dates." actions={<><button className="btn btn-secondary"><Icon name="download" />Download lease</button><button className="btn btn-primary" onClick={() => ctx.go('messages')}><Icon name="message" />Contact landlord</button></>} />
      <div className="dash-grid">
        <div>
          <div className="lease-hero" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div className="eyebrow">Active lease</div><h2>{L.title}</h2><div className="addr"><Icon name="mapPin" />{L.address}</div></div>
              <span className="chip chip--paid" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}><span className="dot" style={{ background: 'var(--green-200)' }}></span>{L.status}</span>
            </div>
            <div className="lease-row" style={{ flexWrap: 'wrap', gap: 24 }}>
              <div><div className="k">Start date</div><div className="v">{L.start}</div></div>
              <div><div className="k">End date</div><div className="v">{L.end}</div></div>
              <div><div className="k">Annual rent</div><div className="v">{money(L.rent)}</div></div>
              <div><div className="k">Deposit</div><div className="v">{money(L.deposit)}</div></div>
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block' }}>Lease terms</h3>
            {[['Tenancy type', 'Fixed term · 12 months'], ['Renewal', L.renewal], ['Deposit held in', 'Ilé Escrow'], ['Maintenance', 'Landlord covers structural; tenant covers minor'], ['Notice period', '60 days before expiry']].map(r => (
              <div key={r[0]} className="settings-row"><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', textAlign: 'right', maxWidth: '60%' }}>{r[1]}</span></div>
            ))}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Landlord</h3>
            <div className="avatar-block" style={{ marginBottom: 14 }}><Avatar name={L.landlord} /><div className="avatar-meta"><span className="avatar-name">{L.landlord}</span><span className="avatar-role">Verified landlord</span></div></div>
            <TrustRing val={L.landlordTrust} size={48} label="Trust score" tier="Excellent" />
            <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Send a message</button>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Quick actions</h3>
            {[['wallet', 'Pay rent', 'pay'], ['wrench', 'Report an issue', 'maintenance'], ['doc', 'View documents', 'documents'], ['star', 'Leave a review', 'reviews']].map(a => (
              <div key={a[1]} className="msg-row" onClick={() => a[2] === 'pay' ? ctx.requireVerified(() => ctx.go('pay')) : ctx.go(a[2])}><div className="feed-ic" style={{ background: 'var(--green-50)', color: 'var(--primary)' }}><Icon name={a[0]} /></div><div className="msg-meta"><div className="msg-name">{a[1]}</div></div><Icon name="chevronRight" style={{ width: 18, height: 18, color: 'var(--ink-300)' }} /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SavedCompare, Application, Lease, MiniUpload });
