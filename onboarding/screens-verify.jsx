/* Ilé Onboarding — Identity & Property verification screens */

/* Reusable "why verification matters" callout */
function WhyVerify({ children }) {
  return (
    <div className="trust-callout">
      <Icon name="shieldCheck" />
      <p>{children}</p>
    </div>
  );
}

/* ---------------- Identity: Legal info ---------------- */
function IdLegalScreen({ data, setData, next, back }) {
  const [touched, setTouched] = useState(false);
  const d = data.legal || {};
  const set = (k, v) => setData({ legal: { ...d, [k]: v } });
  const nameOk = (d.name || '').trim().length > 3;
  const ninOk = (d.nin || '').replace(/\D/g, '').length === 11;
  const valid = nameOk && ninOk && d.dob && d.address;
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Identity verification</div>
      <h1 className="ob-title">Your legal details</h1>
      <p className="ob-desc">These must match your government ID exactly. We use them to verify you and protect every party you transact with.</p>

      <Field label="Legal full name" req error={touched && !nameOk ? 'Enter your full legal name.' : ''}>
        <TextInput placeholder="e.g. Adaeze Chioma Okonkwo" value={d.name || ''} error={touched && !nameOk} onChange={e => set('name', e.target.value)} />
      </Field>
      <Field label="Date of birth" req error={touched && !d.dob ? 'Required.' : ''}>
        <TextInput type="date" value={d.dob || ''} error={touched && !d.dob} onChange={e => set('dob', e.target.value)} />
      </Field>
      <Field label="NIN (National Identity Number)" req hint="11 digits — used for KYC verification." error={touched && !ninOk ? 'NIN must be 11 digits.' : ''}>
        <TextInput inputMode="numeric" placeholder="12345678901" value={d.nin || ''} error={touched && !ninOk} onChange={e => set('nin', e.target.value)} />
      </Field>
      <Field label="Residential address" req error={touched && !d.address ? 'Required.' : ''}>
        <TextInput placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos" value={d.address || ''} error={touched && !d.address} onChange={e => set('address', e.target.value)} />
      </Field>

      <WhyVerify><b>Why this matters:</b> verified identity unlocks escrow, raises your trust score, and lets others confirm they’re dealing with a real person.</WhyVerify>

      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }} onClick={() => { setTouched(true); if (valid) next(); }}>
        Continue<Icon name="arrowRight" />
      </button>
      <SecureNote>Your NIN is encrypted and verified against NIMC — never displayed publicly.</SecureNote>
    </div>
  );
}

/* ---------------- Identity: ID Upload ---------------- */
const ID_TYPES = [['NIN Slip', 'idCard'], ['Driver’s License', 'car'], ['Int’l Passport', 'passport'], ['Voter’s Card', 'vote']];

function IdUploadScreen({ data, setData, next, back }) {
  const [docType, setDocType] = useState(data.idType || '');
  const [uploaded, setUploaded] = useState(!!data.idUploaded);
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Identity verification</div>
      <h1 className="ob-title">Upload your ID</h1>
      <p className="ob-desc">Choose a document type, then upload a clear photo. Make sure all four corners and text are readable.</p>

      <div className="doc-type-grid">
        {ID_TYPES.map(t => (
          <button key={t[0]} className={"doc-type" + (docType === t[0] ? " sel" : "")} onClick={() => { setDocType(t[0]); setData({ idType: t[0] }); }}>
            <Icon name={t[1]} /><span>{t[0]}</span>
          </button>
        ))}
      </div>

      {docType && (
        <div className="ob-fade" style={{ marginBottom: 8 }}>
          <UploadCard label={docType} fileName={docType.replace(/[’']/g, '') + '.jpg'} fileSize="1.8 MB"
            onUploaded={() => { setUploaded(true); setData({ idUploaded: true }); }} />
        </div>
      )}

      <div className="trust-callout" style={{ marginTop: 14, background: 'var(--surface-sunken)', borderColor: 'var(--ink-150)' }}>
        <Icon name="eye" style={{ color: 'var(--ink-500)' }} />
        <p>Tip: lay the document flat on a dark surface in good light. Avoid glare and cropping.</p>
      </div>

      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }} disabled={!docType || !uploaded} onClick={next}>
        Continue<Icon name="arrowRight" />
      </button>
      <SecureNote>Documents are reviewed by our compliance team and stored encrypted.</SecureNote>
    </div>
  );
}

/* ---------------- Identity: Selfie ---------------- */
function SelfieScreen({ data, setData, next, back }) {
  const [phase, setPhase] = useState(data.selfieDone ? 'ok' : 'idle'); // idle | scan | ok
  function capture() {
    setPhase('scan');
    setTimeout(() => { setPhase('ok'); setData({ selfieDone: true }); }, 2600);
  }
  return (
    <div className="ob-card ob-fade" style={{ textAlign: 'center' }}>
      <button className="ob-back" onClick={back} style={{ textAlign: 'left' }}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Identity verification</div>
      <h1 className="ob-title">Liveness check</h1>
      <p className="ob-desc">Take a quick selfie so we can match your face to your ID. Look straight at the camera.</p>

      <div className="selfie-wrap">
        <div className={"viewfinder " + phase}>
          <div className="ring"></div>
          <div className="scan-line"></div>
          {phase === 'ok'
            ? <Icon name="check" style={{ width: 64, height: 64, color: 'var(--success)' }} />
            : <div className="face-glyph"><Icon name="face" /></div>}
        </div>
        <div className="viewfinder-hint" style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: phase === 'scan' ? 'var(--primary)' : 'var(--ink-500)', marginTop: 10 }}>
          {phase === 'idle' ? 'Position your face in the circle' : phase === 'scan' ? 'Analyzing… hold still' : 'Face matched to ID ✓'}
        </div>
      </div>

      {phase !== 'ok' ? (
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }} disabled={phase === 'scan'} onClick={capture}>
          {phase === 'scan' ? 'Capturing…' : <><Icon name="camera" />Capture selfie</>}
        </button>
      ) : (
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }} onClick={next}>
          Submit for verification<Icon name="arrowRight" />
        </button>
      )}
      <SecureNote>Your selfie is used only for verification and biometric matching.</SecureNote>
    </div>
  );
}

/* ---------------- Identity: Submission status ---------------- */
function IdStatusScreen({ data, next }) {
  const [approved, setApproved] = useState(false);
  useEffect(() => { const t = setTimeout(() => setApproved(true), 3200); return () => clearTimeout(t); }, []);
  const items = [
    ['NIN verified against NIMC', true],
    [(data.idType || 'ID document') + ' authenticated', true],
    ['Face match & liveness', true],
    ['Compliance review', approved]
  ];
  return (
    <div className="ob-card ob-fade" style={{ textAlign: 'center' }}>
      <div className="status-hero">
        <div className={"status-badge " + (approved ? 'ok' : 'review')}>
          <Icon name={approved ? 'shieldCheck' : 'clock'} />
        </div>
        <div className="ob-eyebrow">{approved ? 'Identity verified' : 'Verification in progress'}</div>
        <h1 className="ob-title">{approved ? 'You’re verified!' : 'Reviewing your details'}</h1>
        <p className="ob-desc" style={{ marginBottom: 8 }}>
          {approved
            ? 'Your identity is confirmed. Your trust score just went up — others can now see you’re a verified Ilé member.'
            : 'This usually takes under 10 minutes. You can keep going — we’ll notify you the moment it’s done.'}
        </p>
      </div>

      <div className="review-list" style={{ textAlign: 'left' }}>
        {items.map((it, i) => (
          <div className="review-item" key={i}>
            <div className={"ri-ic " + (it[1] ? 'ok' : 'wait')}>
              {it[1] ? <Icon name="check" /> : <span className="skeleton sk-circle" style={{ width: 14, height: 14 }}></span>}
            </div>
            <div className="ri-txt">{it[0]}</div>
            <div className="ri-state" style={{ color: it[1] ? 'var(--success-text)' : 'var(--warning-text)' }}>{it[1] ? 'Done' : 'Checking'}</div>
          </div>
        ))}
      </div>

      {approved && (
        <div className="ob-fade" style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div className="trust"><div className="trust-ring" style={{ '--val': 68, '--score-color': 'var(--gold-500)', position: 'relative' }}><div className="inner">68</div></div>
            <div className="trust-meta" style={{ textAlign: 'left' }}><span className="trust-label">New trust score</span><span className="trust-tier">Good · verified identity</span></div></div>
        </div>
      )}

      <button className="btn btn-primary btn-lg btn-block" onClick={next}>
        {approved ? 'Continue' : 'Continue while we review'}<Icon name="arrowRight" />
      </button>
    </div>
  );
}

/* ---------------- Property: Document upload (Landlord/Owner) ---------------- */
const PROP_DOCS = [
  ['Certificate of Occupancy (C of O)', 'cert', 'CofO.pdf', '2.4 MB'],
  ['Deed of Assignment', 'deed', 'DeedOfAssignment.pdf', '1.9 MB'],
  ['Survey Plan / Title Deed', 'doc', 'SurveyPlan.pdf', '3.1 MB']
];

function PropDocsScreen({ data, setData, next, back }) {
  const [done, setDone] = useState(data.propDocs || {});
  const required = 2; // C of O + one ownership doc
  const count = Object.values(done).filter(Boolean).length;
  function mark(i) { const nx = { ...done, [i]: true }; setDone(nx); setData({ propDocs: nx }); }
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Property verification</div>
      <h1 className="ob-title">Verify your ownership</h1>
      <p className="ob-desc">As a {data.role}, upload your property documents. Verified ownership lets you list, transact via escrow, and earn the Verified Property badge.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PROP_DOCS.map((doc, i) => (
          <div key={i}>
            <div className="label-cap" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--ink-700)' }}>
              <Icon name={doc[1]} style={{ width: 16, height: 16, color: 'var(--primary)' }} />{doc[0]}{i < 2 && <span style={{ color: 'var(--error)' }}>*</span>}
            </div>
            <UploadCard label={doc[0]} fileName={doc[2]} fileSize={doc[3]} onUploaded={() => mark(i)} />
          </div>
        ))}
      </div>

      <WhyVerify><b>Trust = transactions.</b> Listings from verified owners get 3× more enquiries and qualify for escrow-protected sales.</WhyVerify>

      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }} disabled={count < required} onClick={next}>
        {count < required ? `Upload ${required - count} more required document${required - count > 1 ? 's' : ''}` : 'Submit for review'}<Icon name="arrowRight" />
      </button>
      <SecureNote>Documents are checked against land registry records by our compliance team.</SecureNote>
    </div>
  );
}

/* ---------------- Property: Review status ---------------- */
function PropStatusScreen({ next }) {
  return (
    <div className="ob-card ob-fade" style={{ textAlign: 'center' }}>
      <div className="status-hero">
        <div className="status-badge review"><Icon name="building" /></div>
        <div className="ob-eyebrow">Property under review</div>
        <h1 className="ob-title">Documents submitted</h1>
        <p className="ob-desc">Our compliance team is cross-checking your documents with the land registry. Property verification typically completes within 24–48 hours.</p>
      </div>

      <div className="review-list" style={{ textAlign: 'left' }}>
        {[['Documents received', true], ['Authenticity check', true], ['Land registry cross-check', false], ['Verified Property badge issued', false]].map((it, i) => (
          <div className="review-item" key={i}>
            <div className={"ri-ic " + (it[1] ? 'ok' : 'wait')}>{it[1] ? <Icon name="check" /> : <Icon name="clock" />}</div>
            <div className="ri-txt">{it[0]}</div>
            <div className="ri-state" style={{ color: it[1] ? 'var(--success-text)' : 'var(--warning-text)' }}>{it[1] ? 'Done' : 'Pending'}</div>
          </div>
        ))}
      </div>

      <WhyVerify>You can start setting up listings now. They’ll go live with the <b>Verified Property</b> badge once review completes.</WhyVerify>

      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }} onClick={next}>Continue to dashboard<Icon name="arrowRight" /></button>
    </div>
  );
}

/* ---------------- Done ---------------- */
const ROLE_APPS = {
  'Renter': 'GetRentos Renter App.html',
  'Landlord': 'GetRentos Landlord App.html',
  'Property Owner / Seller': 'GetRentos Seller App.html',
  'Property Buyer': 'GetRentos Buyer App.html',
  'Realtor': 'GetRentos Realtor App.html',
  'Agent': 'GetRentos Agent App.html'
};

/* ---------------- Welcome: fast entry to the dashboard ---------------- */
function unlockCopy(role) {
  const supply = ['Landlord', 'Property Owner / Seller', 'Realtor', 'Agent'].includes(role);
  return supply
    ? 'Explore your workspace and set things up right away. To publish listings, move money through escrow or transact, you’ll verify your identity — just a few minutes.'
    : 'Browse, save and compare homes right away. To make an offer, pay through escrow or message owners, you’ll verify your identity — about 2 minutes.';
}

function WelcomeScreen({ data, goVerify, onEnter }) {
  const appFile = ROLE_APPS[data.role];
  const enter = () => { if (appFile) window.location.href = encodeURI(appFile); else onEnter(); };
  const roleLabel = (data.role || 'your').replace('Property Owner / Seller', 'seller').toLowerCase();
  return (
    <div className="ob-card ob-fade" style={{ textAlign: 'center' }}>
      <div className="status-hero">
        <div className="status-badge ok"><Icon name="sparkle" /></div>
        <div className="ob-eyebrow">You’re in</div>
        <h1 className="ob-title">Welcome to Ilé</h1>
        <p className="ob-desc">Your {roleLabel} workspace is ready. Jump straight in and start exploring — no waiting around.</p>
      </div>

      <button className="btn btn-primary btn-lg btn-block" onClick={enter}>
        Go to my dashboard<Icon name="arrowRight" />
      </button>

      <div className="card card-pad" style={{ textAlign: 'left', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div className="role-ic" style={{ width: 40, height: 40, flex: 'none' }}><Icon name="shieldCheck" /></div>
          <div>
            <h4 style={{ margin: 0, font: 'var(--text-body)', fontWeight: 650, color: 'var(--ink-900)' }}>Verify to unlock the full platform</h4>
            <p style={{ margin: '4px 0 0', font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{unlockCopy(data.role)}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={goVerify}>
          <Icon name="shieldCheck" />Verify my identity now
        </button>
      </div>

      <SecureNote>You can verify any time from your dashboard.</SecureNote>
    </div>
  );
}

function DoneScreen({ data, onEnter, onRestart }) {
  const appFile = ROLE_APPS[data.role];
  const enter = () => { if (appFile) window.location.href = encodeURI(appFile); else onEnter(); };
  return (
    <div className="ob-card ob-fade" style={{ textAlign: 'center' }}>
      <div className="status-hero">
        <div className="status-badge ok"><Icon name="sparkle" /></div>
        <div className="ob-eyebrow">All set</div>
        <h1 className="ob-title">You’re fully verified</h1>
        <p className="ob-desc">Your identity is confirmed and your full toolkit is unlocked. Here’s your starting trust profile — it grows with every successful, on-time transaction.</p>
      </div>

      <div className="card card-pad" style={{ textAlign: 'left', marginBottom: 18 }}>
        <div className="avatar-block" style={{ marginBottom: 14 }}>
          <div className="avatar avatar--lg">{(data.legal?.name || 'GR').split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
          <div className="avatar-meta">
            <span className="avatar-name" style={{ fontSize: '1.05rem' }}>{data.legal?.name || 'New member'}</span>
            <span className="avatar-role">{data.role}</span>
          </div>
          <span className="vbadge vbadge--verified" style={{ marginLeft: 'auto' }}><Icon name="shieldCheck" />Verified</span>
        </div>
        <hr className="divider" style={{ margin: '14px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="trust"><div className="trust-ring" style={{ '--val': 68, '--score-color': 'var(--gold-500)', position: 'relative', '--sz': '48px' }}><div className="inner">68</div></div>
            <div className="trust-meta"><span className="trust-label">Trust score</span><span className="trust-tier">Good</span></div></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)' }}>Identity</div>
            <span className="chip chip--paid" style={{ marginTop: 4 }}><span className="dot"></span>Verified</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-lg btn-block" onClick={enter}>Enter my dashboard<Icon name="arrowRight" /></button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={onRestart}>Restart the flow</button>
    </div>
  );
}

Object.assign(window, { IdLegalScreen, IdUploadScreen, SelfieScreen, IdStatusScreen, PropDocsScreen, PropStatusScreen, WelcomeScreen, DoneScreen });
